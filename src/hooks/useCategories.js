"use client";

import { useEffect, useState } from "react";
import { fetchCategories } from "@/lib/products";

export function useCategories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let ignore = false;

    fetchCategories()
      .then((data) => {
        if (!ignore) setCategories(data);
      })
      .catch(() => {
        if (!ignore) setCategories([]);
      });

    return () => {
      ignore = true;
    };
  }, []);

  return categories;
}
