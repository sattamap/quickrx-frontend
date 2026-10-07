import Swal from "sweetalert2";

export const showSuccess = async (
  message: string,
): Promise<void> => {
  await Swal.fire({
    icon: "success",
    title: "Success",
    text: message,
    confirmButtonText: "OK",
  });
};

export const showError = async (
  message: string,
): Promise<void> => {
  await Swal.fire({
    icon: "error",
    title: "Error",
    text: message,
    confirmButtonText: "OK",
  });
};

export const showWarning = async (
  message: string,
): Promise<void> => {
  await Swal.fire({
    icon: "warning",
    title: "Warning",
    text: message,
    confirmButtonText: "OK",
  });
};

export const showDeleteConfirmation = async (
  message = "Are you sure you want to delete this?",
): Promise<boolean> => {
  const result = await Swal.fire({
    icon: "warning",
    title: "Are you sure?",
    text: message,
    showCancelButton: true,
    confirmButtonText: "Yes, delete it",
    cancelButtonText: "Cancel",
    reverseButtons: true,
  });

  return result.isConfirmed;
};