import { orderApi } from "@/api/order.api";
import { userApi } from "@/api/user.api";
import { cartApi } from "@/api/cart.api";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import path from "@/configs/path.config";
import { useQueryParams } from "@/hooks/useQueryParams";
import { cn } from "@/lib/utils";

import { RootState } from "@/stores/store";
import { TCreateOrder } from "@/types/order.type";
import { TVoucher } from "@/types/voucher.type";
import { formatCurrency } from "@/utils/format-currency.util";
import { caculatorDistance } from "@/utils/geolocation";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronLeft, CreditCard } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { createSearchParams, Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import DialogOrder from "./components/dialog-order";
import FormUser, {
  formUserSchema,
  FormUserType,
} from "@/pages/checkout/components/form-user";
import ListVoucher from "./components/list-voucher";
import { useAppDispatch, useAppSelector } from "@/stores/hook";
import { Button } from "antd";
import { clearCart } from "@/stores/features/cart/cart-slice";

const FEE_SHIPPING = 3000;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleVNpay = async (data: any, paymentMethod: string) => {
  if (paymentMethod === "vnpay") {
    // Xử lý VNPay
    try {
      const response = await fetch(
        "http://localhost:8080/api/v1/create_payment_url",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: data.total,
            orderDescription: `Thanh toán đơn hàng ${data?._id}`,
            bankCode: "",
          }),
        }
      );

      if (response.ok) {
        const paymentData = await response.json();
        if (paymentData.paymentUrl) {
          window.location.href = paymentData.paymentUrl;
        } else {
          toast.error("Không tạo được liên kết thanh toán VNPay.");
        }
      } else {
        const errorData = await response.json();
        console.error("Error creating VNPay payment URL:", errorData);
        toast.error("Có lỗi xảy ra trong quá trình xử lý thanh toán VNPay.");
      }

      const paymentData = await response.json();
      if (paymentData.paymentUrl) {
        window.location.href = paymentData.paymentUrl;
      } else {
        toast.error("Không tạo được liên kết thanh toán VNPay.");
      }
    } catch (error) {
      console.error("Error creating VNPay payment URL:", error);
      toast.error("Có lỗi xảy ra trong quá trình xử lý thanh toán VNPay.");
    }
    return; // Kết thúc nếu chọn VNPay
  }
};

const Checkout = () => {
  const { status } = useQueryParams();
  const navigate = useNavigate();

  const form = useForm<FormUserType>({
    resolver: yupResolver(formUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      note: "",
    },
  });

  /// IIFE: Immediately Invoked Function Expression
  const [paymentMethod, setPaymentMethod] = useState<string>("cod");
  const [distanceShipping, setDistanceShipping] = useState<number>(0);
  const [voucherPrice, setVoucherPrice] = useState<number>(0);
  const [voucherId, setVoucherId] = useState<string>("");

  const { carts: cartItems } = useAppSelector((state: RootState) => state.cart);
  console.log("🚀 ~ Checkout ~ cartItems:", cartItems);

  // tính tổng tiền các sản phẩm có checked là true
  const totalCheckedPurchase = useMemo(() => {
    const totalProductChecked = cartItems?.reduce((total, purchase) => {
      return total + purchase.quantity * purchase.productId.price;
    }, 0);
    return totalProductChecked;
  }, [cartItems]);

  useEffect(() => {
    (async () => {
      try {
        const distance = await caculatorDistance();
        setDistanceShipping(Math.round(Number(distance.toFixed(1))));
      } catch (error) {
        console.log("🚀 ~ error:", error);
      }
    })();
  }, []);

  // giá tiền phí vận chuyển
  const moneyShipping = distanceShipping * FEE_SHIPPING;
  const totalMoney = totalCheckedPurchase + moneyShipping;

  const handleSelectedVoucher = (voucher: TVoucher) => {
    if (totalCheckedPurchase <= voucher.applicablePrice) {
      toast.warning("Đơn hàng chưa đủ điều kiện!");
      return;
    }
    toast.success("Chọn mã giảm giá thành công!");
    setVoucherPrice(voucher.voucherPrice);
    setVoucherId(voucher._id);
  };

  // get me info
  const { data } = useQuery({
    queryKey: ["me"],
    queryFn: () => userApi.getProfile(),
    retry: false,
  });
  const myInfo = data?.data;

  // khai báo api create order
  const createOrderMutation = useMutation({
    mutationKey: ["create-order"],
    mutationFn: (body: TCreateOrder) => orderApi.createOrder(body),
  });

  const dispatch = useAppDispatch();

  // useEffect()
  // handle submit form user
  const onSubmit = async (values: FormUserType) => {
    const data = {
      userId: myInfo?._id,
      status: "pending",
      note: values.note,
      paymentMethod: paymentMethod,
      total: totalMoney - voucherPrice,
      products: cartItems.map((purchase) => ({
        productId: purchase.productId._id,
        quantity: purchase.quantity,
        size: purchase.size,
        color: purchase.color,
        price: purchase.productId.price,
      })),
      infoOrderShipping: {
        name: `${values.firstName} ${values.lastName}`,
        phone: values.phone,
        address: values.address,
        email: values.email,
      },
      priceShipping: distanceShipping * FEE_SHIPPING,
      voucher: voucherId,
    } as TCreateOrder;
    console.log(data);
    // call api
    createOrderMutation.mutate(data, {
      onSuccess: async () => {
        toast.success("Create order success!");

        // Clear the cart after successful order
        if (myInfo?._id) {
          try {
            await cartApi.clearCart(myInfo._id);
            // Clear cart in Redux store
            dispatch(clearCart());
          } catch (error) {
            console.error("Failed to clear cart:", error);
          }
        }

        handleVNpay(data, paymentMethod);
        navigate({
          pathname: path.checkout,
          search: createSearchParams({
            status: "true",
          }).toString(),
        });
      },
      onError: () => {
        toast.error("Create order failed!");
      },
    });
  };

  return (
    <>
      <DialogOrder open={Boolean(status)} onClose={() => {}} />

      <div className="w-full min-h-screen bg-gray-100">
        <div className="container px-4 py-8 mx-auto">
          <Link to={path.cart} className="mb-6 flex items-center gap-1">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Quay lại giỏ hàng
          </Link>
          <h1 className="mb-8 text-3xl font-bold">Thanh toán</h1>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="space-y-6 md:col-span-2">
              <FormUser form={form} onSubmit={onSubmit} />

              <div className="p-6 bg-white rounded-lg shadow">
                <h2 className="mb-4 text-xl font-semibold">
                  Phương thức thanh toán
                </h2>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                >
                  <div className="flex items-center mb-2 space-x-2">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod">Cod</Label>
                  </div>
                  <div className="flex items-center mb-2 space-x-2">
                    <RadioGroupItem value="vnpay" id="vnpay" />
                    <Label htmlFor="vnpay">VNPay</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      disabled={true}
                      value="bank-transfer"
                      id="bank-transfer"
                    />
                    <Label htmlFor="bank-transfer">
                      Chuyển khoản ngân hàng
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <div className="space-y-6 h-full">
              <div className="p-6 bg-white rounded-lg shadow">
                <h2 className="mb-4 text-xl font-semibold">Tóm tắt đơn hàng</h2>
                <div className="space-y-4">
                  {cartItems &&
                    cartItems.length > 0 &&
                    cartItems.map((item) => (
                      <div
                        key={item._id}
                        className="flex justify-between gap-6"
                      >
                        <span>
                          {item?.productId?.nameProduct} x {item.quantity}
                        </span>
                        <span>
                          {formatCurrency(
                            item?.productId?.price * item.quantity
                          )}
                        </span>
                      </div>
                    ))}
                  <Separator />
                  <div className="flex justify-between">
                    <span>Tạm tính</span>
                    <span>{formatCurrency(totalCheckedPurchase || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mã giảm giá</span>
                    <span>{formatCurrency(voucherPrice || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí vận chuyển</span>
                    <span>{formatCurrency(moneyShipping)}</span>
                  </div>

                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Tổng cộng</span>
                    <span>{formatCurrency(totalMoney - voucherPrice)}</span>
                  </div>
                </div>
                <Button
                  // htmlFor="submit-form"
                  htmlType="submit"
                  loading={createOrderMutation.isSuccess}
                  onClick={form.handleSubmit(onSubmit)}
                  className={cn(
                    "w-full mt-6 h-9 flex items-center text-white gap-2 cursor-pointer justify-center rounded-md bg-green-900",
                    {
                      "select-none cursor-not-allowed":
                        createOrderMutation.isPending,
                    }
                  )}
                >
                  <CreditCard className="w-4 h-4 mr-2 " />
                  Thanh toán {formatCurrency(totalMoney - voucherPrice)}
                </Button>
              </div>

              {/* voucher */}
              <ListVoucher onSelectedVoucher={handleSelectedVoucher} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
