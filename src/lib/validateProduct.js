export function validateProduct(values) {
  const errors = {};

  if (!values.title || !values.title.trim()) {
    errors.title = "Title is required.";
  }

  if (!values.category) {
    errors.category = "Category is required.";
  }

  if (!values.description || !values.description.trim()) {
    errors.description = "Description is required.";
  }

  const price = Number(values.price);
  if (values.price === "" || Number.isNaN(price) || price <= 0) {
    errors.price = "Price must be a positive number.";
  }

  const stock = Number(values.stock);
  if (values.stock === "" || Number.isNaN(stock) || stock < 0) {
    errors.stock = "Stock must be zero or greater.";
  }

  if (values.rating !== "" && values.rating !== undefined) {
    const rating = Number(values.rating);
    if (Number.isNaN(rating) || rating < 0 || rating > 5) {
      errors.rating = "Rating must be between 0 and 5.";
    }
  }

  return errors;
}
