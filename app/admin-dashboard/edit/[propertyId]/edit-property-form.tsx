"use client";

import PropertyForm from "@/components/property-form";
import { useAuth } from "@/context/auth";
import { storage } from "@/firebase/client";
import { useToast } from "@/hooks/use-toast";
import { Property } from "@/types/property";
import { propertySchema } from "@/validation/propertySchema";
import {
  deleteObject,
  ref,
  uploadBytesResumable,
  UploadTask,
} from "firebase/storage";
import { z } from "zod";
import { updateProperty } from "./actions";

type Props = Property;

export default function EditPropertyForm({
  id,
  address1,
  address2,
  city,
  postcode,
  bathrooms,
  bedrooms,
  description,
  price,
  status,
  images = [],
}: Props) {
  const auth = useAuth();
  const { toast } = useToast();
  const handleSubmit = async (data: z.infer<typeof propertySchema>) => {
    const token = await auth?.currentUser?.getIdToken();

    if (!token) {
      return;
    }

    const { images: newImages, ...rest } = data;

    const response = await updateProperty({ ...rest, id }, token);

    if (!!response?.error) {
      toast({
        title: "Error!",
        description: response.message,
        variant: "destructive",
      });
      return;
    }

    const storageTasks: (UploadTask | Promise<void>)[] = [];
    const imagesToDelete = images.filter(
      (image) => !newImages.some((newImage) => image === newImage.url)
    );

    imagesToDelete.forEach((image) => {
      const deleteTask = deleteObject(ref(storage, image)).catch((error) => {
        if (error.code !== "storage/object-not-found") {
          console.error(`Error deleting image ${image}:`, error);
        }
      });
      storageTasks.push(deleteTask);
    });

    const paths: string[] = [];
    newImages.forEach((image, index) => {
      if (image.file) {
        const path = `properties/${id}/${Date.now()}-${index}-${
          image.file.name
        }`;
        paths.push(path);
        const storageRef = ref(storage, path);
        storageTasks.push(uploadBytesResumable(storageRef, image.file));
      } else {
        paths.push(image.url);
      }
    });

    // await Promise.all(storageTasks);

    // await savePropertyImages({ propertyId: id, images: paths }, token);

    // toast({
    //   title: "Success!",
    //   description: "Property updated",
    //   variant: "success",
    // });
    // router.push("/admin-dashboard");
  };
  return (
    <div>
      <PropertyForm
        handleSubmit={handleSubmit}
        submitButtonLabel="Save Property"
        defaultValues={{
          address1,
          address2,
          city,
          postcode,
          bathrooms,
          bedrooms,
          description,
          price,
          status,
          images: images.map((image) => ({
            id: image,
            url: image,
          })),
        }}
      />
    </div>
  );
}
