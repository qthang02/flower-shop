import Aside from "./components/aside";
import Card from "./components/card";
import { productApi } from "@/api/product.api";
import { useQuery } from "@tanstack/react-query";
import { useQueryParams } from "@/hooks/useQueryParams";
import { Carousel } from "antd";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
const HomePage = () => {
  const params = useQueryParams();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // Extract search query from URL params
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const search = searchParams.get("search");
    setSearchQuery(search || "");
  }, [location.search]);

  const { data, isLoading } = useQuery({
    queryKey: ["products", params],
    queryFn: () =>
      productApi.getProducts({ ...params, deleted: "false", status: "active" }),
  });

  // Get products from API response
  const products = data?.docs || [];
  let filteredProducts = [...products];
  
  // Apply search filter
  if (searchQuery && filteredProducts.length > 0) {
    filteredProducts = filteredProducts.filter(product => 
      product.nameProduct.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.desc && product.desc.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }
  
  // Apply price filter
  const minPrice = params.min_price ? parseFloat(params.min_price as string) : null;
  const maxPrice = params.max_price ? parseFloat(params.max_price as string) : null;
  
  console.log('Price filter params:', { minPrice, maxPrice });
  console.log('Products before filter:', products.length);
  
  if ((minPrice !== null || maxPrice !== null) && filteredProducts.length > 0) {
    filteredProducts = filteredProducts.filter(product => {
      // Calculate actual price considering sale discount
      // Based on the Card component, it appears sale is a fixed amount, not a percentage
      const actualPrice = product.sale > 0 
        ? product.price - product.sale
        : product.price;
      
      // Debug logging
      console.log(`Product: ${product.nameProduct}, Price: ${product.price}, Sale: ${product.sale}, ActualPrice: ${actualPrice}`);
      
      // Check if the price is within the specified range
      const passesFilter = (
        (minPrice === null || actualPrice >= minPrice) &&
        (maxPrice === null || actualPrice <= maxPrice)
      );
      
      return passesFilter;
    });
    
    console.log('Products after filter:', filteredProducts.length);
  }

  // Kiểm tra params có rỗng hay không (not including price filters)
  const hasPriceFilter = params.min_price || params.max_price;
  const isParamsEmpty = Object.keys(params).filter(key => key !== 'min_price' && key !== 'max_price').length === 0 && !searchQuery;

  const contentStyle: React.CSSProperties = {
    margin: 0,
    height: "400px",
    color: "#fff",
    textAlign: "center",
    marginTop: "35px",
    borderRadius: "10px",
    objectFit: "fill",
  };

  const imageStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };

  return (
    <main className="container flex flex-col flex-grow px-4 py-2 mx-auto mt-0 space-y-6">
      {/* Phần Carousel */}
      {isParamsEmpty && (
        <Carousel
          effect="fade"
          arrows
          infinite={true}
          autoplay
          autoplaySpeed={1600}
          className="mb-8"
        >
          <div className="mt-0 h-1.6/4">
            <img
              src="https://assets.eflorist.com/images/homepage/immersion/immersion_banner_fall.gif"
              alt="Slide 1"
              style={{ ...imageStyle, ...contentStyle }}
            />
          </div>
          <div>
            <img
              src="https://assets.eflorist.com/images/homepage/immersion/immersion-get-well-flowers.jpg"
              alt="Slide 2"
              style={{ ...imageStyle, ...contentStyle }}
            />
          </div>
          <div>
            <img
              src="https://www.ibuyflowers.com/hubfs/Wed%20love%20your%20feedback%20%287%29.png"
              alt="Slide 3"
              style={{ ...imageStyle, ...contentStyle }}
            />
          </div>
          <div>
            <img
              src="https://assets.intleflorist.com/site/in3300079/Homepage/McIvor's.png"
              alt="Slide 4"
              style={{ ...imageStyle, ...contentStyle }}
            />
          </div>
        </Carousel>
      )}

      {/* Phần dưới gồm Aside và danh sách sản phẩm */}
      <div className="flex flex-col lg:flex-row flex-grow space-y-6 lg:space-y-0">
        {/* Phần Aside */}
        <Aside />
        {/* Danh sách sản phẩm */}
        <div className="lg:w-9/12 w-full">
          <section>
            {searchQuery ? (
              <p className="text-lg font-semibold text-green-900">
                Kết quả tìm kiếm cho "{searchQuery}"
              </p>
            ) : (
              <p className="text-lg font-semibold text-green-900">Các sản phẩm nổi bật</p>
            )}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 lg:grid-cols-3 mt-4">
              {isLoading ? (
                <div className="col-span-full text-center py-8">Đang tải...</div>
              ) : filteredProducts && filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <Card key={product._id} product={product} />
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  {searchQuery 
                    ? `Không tìm thấy sản phẩm nào phù hợp với "${searchQuery}"`
                    : hasPriceFilter
                    ? `Không tìm thấy sản phẩm nào trong khoảng giá ${parseInt(params.min_price as string || '0').toLocaleString()}₫ - ${parseInt(params.max_price as string || '20000000').toLocaleString()}₫`
                    : "Không có sản phẩm"}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default HomePage;
