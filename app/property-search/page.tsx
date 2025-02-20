import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FilterForm from "./filters-form";
import { Suspense } from "react";
import { getProperties } from "@/data/properties";
import Image from "next/image";
import imageUrlFormatter from "@/lib/imageUrlFormatter";
import { BathIcon, BedIcon, HomeIcon } from "lucide-react";
import numeral from "numeral";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ToggleFavouriteButton from "./toggle-favourite-button";
import { getUserFavourites } from "@/data/favourites";
import { cookies } from "next/headers";
import { auth } from "@/firebase/server";
import { DecodedIdToken } from "firebase-admin/auth";

export default async function PropertySearch({
  searchParams,
}: {
  searchParams: Promise<any>;
}) {
  const searchParamsValue = await searchParams;

  const parsedPage = parseInt(searchParamsValue?.page);
  const parsedMinPrice = parseInt(searchParamsValue?.minPrice);
  const parsedMaxPrice = parseInt(searchParamsValue?.maxPrice);
  const parsedMinBedrooms = parseInt(searchParamsValue?.minBedrooms);

  const page = isNaN(parsedPage) ? 1 : parsedPage;
  const minPrice = isNaN(parsedMinPrice) ? null : parsedMinPrice;
  const maxPrice = isNaN(parsedMaxPrice) ? null : parsedMaxPrice;
  const minBedrooms = isNaN(parsedMinBedrooms) ? null : parsedMinBedrooms;

  const { data, totalPages } = await getProperties({
    pagination: {
      page,
      pageSize: 6,
    },
    filters: {
      minPrice,
      maxPrice,
      minBedrooms,
      status: ["for-sale"],
    },
  });

  const userFavourites = await getUserFavourites();

  const cookieStore = await cookies();
  const token = cookieStore.get("firebaseAuthToken")?.value;
  let verifiedToken: DecodedIdToken | null;

  if (token) {
    verifiedToken = await auth.verifyIdToken(token);
  }

  return (
    <div className="max-w-screen-lg mx-auto">
      <h1 className="text-4xl font-bold p-5">Property Search</h1>
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense>
            <FilterForm />
          </Suspense>
        </CardContent>
      </Card>
      <div className="grid grid-cols-3 mt-5 gap-5">
        {data.map((property) => {
          const addressLine = [
            property.address1,
            property.address2,
            property.city,
            property.postcode,
          ]
            .filter((addressLine) => !!addressLine)
            .join(", ");
          return (
            <Card key={property.id} className="overflow-hidden">
              <CardContent className="px-0 pb-0">
                <div className="h-40 relative bg-sky-50 text-zinc-400 flex flex-col justify-center items-center">
                  {(!verifiedToken || !verifiedToken.admin) && (
                    <ToggleFavouriteButton
                      isFavourite={userFavourites[property.id]}
                      propertyId={property.id}
                    />
                  )}
                  {!!property.images?.[0] && (
                    <Image
                      fill
                      className="object-cover"
                      src={imageUrlFormatter(property.images[0])}
                      alt=""
                    />
                  )}
                  {!property.images?.[0] && (
                    <>
                      <HomeIcon />
                      <small>No Image</small>
                    </>
                  )}
                </div>
                <div className="flex flex-col gap-5 p-5">
                  <p>{addressLine}</p>
                  <div className="flex gap-5">
                    <div className="flex gap-2">
                      <BedIcon /> {property.bedrooms}
                    </div>
                    <div className="flex gap-2">
                      <BathIcon /> {property.bathrooms}
                    </div>
                  </div>
                  <p>${numeral(property.price).format("0,0")}</p>
                  <Button asChild>
                    <Link href={`/property/${property.id}`}>View Property</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="flex gap-2 items-center justify-center py-10">
        {Array.from({ length: totalPages }).map((_, i) => {
          const newSearchParams = new URLSearchParams();

          if (searchParamsValue?.minPrice) {
            newSearchParams.set("minPrice", searchParamsValue.minPrice);
          }

          if (searchParamsValue?.maxPrice) {
            newSearchParams.set("maxPrice", searchParamsValue.maxPrice);
          }

          if (searchParamsValue?.minBedrooms) {
            newSearchParams.set("minBedrooms", searchParamsValue.minBedrooms);
          }

          newSearchParams.set("page", `${i + 1}`);

          return (
            <Button
              key={i}
              asChild={page !== i + 1}
              disabled={page === i + 1}
              variant="outline"
            >
              <Link href={`/property-search?${newSearchParams.toString()}`}>
                {i + 1}
              </Link>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
