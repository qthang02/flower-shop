import { Link, createSearchParams, useNavigate } from "react-router-dom";

import { Slider } from "@/components/ui/slider";
import { brandApi } from "@/api/brand.api";
import { categoryApi } from "@/api/category.api";
import path from "@/configs/path.config";
import { useQuery } from "@tanstack/react-query";
import { useQueryParams } from "@/hooks/useQueryParams";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const Aside = () => {
  const params = useQueryParams();
  const navigate = useNavigate();

  // Initialize price range from URL params or default values (using VND)
  const [priceRange, setPriceRange] = useState([
    params.min_price ? parseInt(params.min_price as string) : 0,
    params.max_price ? parseInt(params.max_price as string) : 20000000
  ]);

  // get all categories
  const { data } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryApi.getAllCategories({ status: "active" }),
  });
  const categories = data?.data?.filter(
    (category) => category.status === "active"
  );

  // get all brands
  const { data: responseBrands } = useQuery({
    queryKey: ["brands"],
    queryFn: () => brandApi.getAllBrands({ status: "active" }),
  });
  const brands = responseBrands?.data?.filter(
    (brand) => brand.status === "active"
  );

  return (
    <aside className="w-3/12 pr-8 ">
      <div className="space-y-6">
        <div>
          <h3 className="mb-2 text-lg font-semibold text-green-900">Danh mục sản phẩm</h3>
          <ul className="space-y-2">
            {categories &&
              categories?.length > 0 &&
              categories.map((category) => {
                return (
                  <li key={category._id} className="relative">
                    <img
                      src={category.image}
                      alt={category.nameCategory}
                      className="w-full h-40 object-cover mr-2 rounded"
                    />
                    <Link
                      to={{
                        pathname: path.home,
                        search: createSearchParams({
                          ...params,
                          category: category._id,
                        }).toString(),
                      }}
                      className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-center py-2 hover:underline"
                    >
                      {category.nameCategory}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </div>
        <div>
          <h3 className="mb-2 text-lg font-semibold text-green-900">
            Các sản phẩm kết hợp thương hiệu
          </h3>
          <ul className="space-y-2">
            {brands &&
              brands?.length > 0 &&
              brands.map((brand) => {
                return (
                  <li key={brand._id}>
                    <Link
                      to={{
                        pathname: path.home,
                        search: createSearchParams({
                          ...params,
                          brand: brand._id,
                        }).toString(),
                      }}
                      className="text-green-900 hover:underline flex w-full font-semibold "
                    >
                      {brand.nameBrand}
                      {brand.image && (
                        <img
                          src={brand.image}
                          alt={brand.nameBrand}
                          className="w-8 h-8 ml-2 flex-col justify-center items-center"
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </div>
        <div>
          <h3 className="mb-2 text-lg font-semibold text-green-900">Giá sản phẩm</h3>
          <Slider
            defaultValue={[0, 20000000]}
            max={20000000}
            step={100000}
            value={priceRange}
            onValueChange={setPriceRange}
            className="mb-2"
          />
          <div className="flex justify-between mb-3">
            <span>{priceRange[0].toLocaleString()}₫</span>
            <span>{priceRange[1].toLocaleString()}₫</span>
          </div>
          <Button 
            onClick={() => {
              navigate({
                pathname: path.home,
                search: createSearchParams({
                  ...params,
                  min_price: priceRange[0].toString(),
                  max_price: priceRange[1].toString()
                }).toString()
              });
            }}
            className="w-full bg-green-800 hover:bg-green-900"
          >
            Áp dụng lọc giá
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Aside;
