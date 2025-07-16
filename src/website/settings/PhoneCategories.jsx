import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Modal, Button, Group, Loader } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

function PhoneCategories() {
  const axios = useAxiosPrivate();
  const [deleteModal, { open, close }] = useDisclosure(false);
  const [editModal, { open: editOpen, close: editClose }] = useDisclosure(
    false
  );
  const [addModal, { open: addOpen, close: addClose }] = useDisclosure(false);
  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    control,
  } = useForm();

  // add category..............................
  // add function
  const addCategory = (categoryData) => {
    return axios.post(`/categories`, categoryData);
  };

  const {
    mutate: addCategoryMutate,
    isLoading: loadingAddCategory,
    error,
  } = useMutation({
    mutationFn: addCategory,
    onSuccess: (response) => {
      toast.success(response?.data?.message);
      queryClient.invalidateQueries(["categories"]);
      addClose();
      reset();
    },
    onError: (err) => {
      const text = err?.response?.data?.message || "something went wrong";
      toast.error(text);
    },
  });
  //   end add category.........

  // delete category
  const deleteCategory = (category) => {
    return axios.delete(`/categories/delete/${categoryId}`, category);
  };

  const { mutate: deleteMutate, isLoading: loadingDelete } = useMutation({
    mutationFn: deleteCategory,
    onSuccess: (response) => {
      toast.success(response?.data?.message);
      queryClient.invalidateQueries(["categories"]);
      close();
      setCategoryId("");
      setCategoryName("");
    },
    onError: (err) => {
      const text = err?.response?.data?.message || "something went wrong";
      toast.error(text);
    },
  });
  //   end delete category.........

  // edit category
  const editCategory = (data) => {
    return axios.patch(`/categories/update/${categoryId}`, data);
  };

  const { mutate: editMutate, isLoading: loadingEdit } = useMutation({
    mutationFn: editCategory,
    onSuccess: (response) => {
      toast.success(response?.data?.message);
      queryClient.invalidateQueries(["categories"]);
      editClose();
      setCategoryId("");
      setCategoryName("");
      setNewName("");
      setNewDescription("");
    },
    onError: (err) => {
      const text = err?.response?.data?.message || "something went wrong";
      toast.error(text);
    },
  });
  //   end edit category.........

  // get categories

  // fetching categories
  const getCategories = async () => {
    return await axios.get(`/categories`);
  };

  const {
    isLoading: loadingCategories,
    data: categoriesData,
    error: categoriesError,
    isError: isCategoriesError,
  } = useQuery({
    queryFn: getCategories,
    queryKey: [`categories`],
    keepPreviousData: true,
    retry: 2,
  });

  const submitCategory = (data) => {
    addCategoryMutate(data);
  };

  return (
    <div className="bg-light py-3 px-2 ">
      {/* delete modal */}
      <Modal
        opened={deleteModal}
        onClose={() => {
          close();
          setCategoryId("");
          setCategoryName("");
        }}
        title="Delete phone category!"
        centered
      >
        <div>
          <h1 className=" py-3">
            Are sure you want to delete{" "}
            <span className="font-bold">{categoryName || "this category"}</span>
            ?
          </h1>
          <div>
            {loadingDelete ? (
              <div className="flex justify-center py-3">
                <Loader color="yellow" />
              </div>
            ) : (
              <div className="flex justify-center items-center gap-3 py-3">
                <button
                  className="px-3 py-2 bg-red-500 text-light rounded-md cursor-pointer bg-opacity-90 hover:bg-opacity-100 "
                  onClick={() => {
                    if (!categoryId) {
                      toast.error("No category selected for deletion");
                      return;
                    }
                    deleteMutate();
                  }}
                >
                  Delete
                </button>
                <button
                  className="px-3 py-2 bg-gray-500 text-light rounded-md cursor-pointer bg-opacity-90 hover:bg-opacity-100 "
                  onClick={() => {
                    close();
                    setCategoryId("");
                    setCategoryName("");
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* edit  modal */}
      <Modal
        opened={editModal}
        onClose={() => {
          editClose();
          setCategoryId("");
          setCategoryName("");
          setNewName("");
          setNewDescription("");
        }}
        title={`Current category: ${categoryName || "Unknown Category"}`}
        centered
      >
        <div>
          <div className=" py-3">
            <div>
              <div className="flex flex-col w-full ">
                <div className="flex flex-col  gap-2 w-full ">
                  <label htmlFor="">Category Name</label>
                  <input
                    type="text"
                    placeholder="Enter new category name"
                    value={newName}
                    className="border-2 w-full rounded-md py-[5px]  px-2 outline-none  focus:border-blue-700 focus:border-2 "
                    onChange={(e) => {
                      setNewName(e.target.value);
                    }}
                  />
                </div>
                <div className="flex flex-col justify-center gap-2 w-full mt-3">
                  <label htmlFor="">Description</label>
                  <textarea
                    value={newDescription}
                    placeholder="Category description"
                    rows={4}
                    className="border w-full rounded-md py-[5px]  px-2 outline-none  focus:border-blue-700 focus:border-1 resize-vertical"
                    onChange={(e) => {
                      setNewDescription(e.target.value);
                    }}
                  />
                </div>
                <div>
                  {loadingEdit ? (
                    <div className="flex justify-center py-4">
                      <Loader color="yellow" />
                    </div>
                  ) : (
                    <div className="flex justify-center gap-3 my-4">
                      <button
                        className="px-9 py-2 bg-primary text-light rounded-md cursor-pointer bg-opacity-90 hover:bg-opacity-100 "
                        onClick={() => {
                          if (!newName?.trim())
                            return toast.warn("Category name is required!");
                          editMutate({
                            categoryId: categoryId,
                            name: newName?.trim(),
                            description: newDescription?.trim(),
                          });
                        }}
                      >
                        Edit
                      </button>
                      <span
                        className="px-3 py-2 bg-gray-500 text-light rounded-md cursor-pointer bg-opacity-90 hover:bg-opacity-100 "
                        onClick={() => {
                          editClose();
                          setCategoryId("");
                          setCategoryName("");
                          setNewName("");
                          setNewDescription("");
                        }}
                      >
                        Cancel
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* add modal */}
      <Modal
        opened={addModal}
        onClose={addClose}
        title={`Add Phone Category`}
        centered
      >
        <form action="" onSubmit={handleSubmit(submitCategory)} className="   ">
          <div className="flex flex-col gap-5  ">
            <div className="flex flex-col justify-center gap-2 w-full ">
              <label htmlFor="">Category Name</label>
              <input
                type="text"
                placeholder="Enter category name (e.g., Smartphones, Tablets)"
                className="border w-full rounded-md py-[5px]  px-2 outline-none  focus:border-blue-700 focus:border-1 "
                {...register("name", {
                  required: true,
                })}
              />
              <p className="text-red-500 text-xs">
                {errors.name?.type === "required" &&
                  "Category name is required"}
              </p>
            </div>
            <div className="flex flex-col justify-center gap-2 w-full ">
              <label htmlFor="">Description</label>
              <textarea
                placeholder="Category description"
                rows={4}
                className="border w-full rounded-md py-[5px]  px-2 outline-none  focus:border-blue-700 focus:border-1 resize-vertical"
                {...register("description", {
                  required: true,
                })}
              />
              <p className="text-red-500 text-xs">
                {errors.description?.type === "required" &&
                  "Description is required"}
              </p>
            </div>
            <div className="flex justify-center ">
              {loadingAddCategory ? (
                <div className="">
                  <Loader color="yellow" />
                </div>
              ) : (
                <button
                  disabled={loadingCategories || loadingAddCategory}
                  className="bg-primary   text-light rounded-md px-5 py-[5px] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-700"
                >
                  Add Category
                </button>
              )}
            </div>
          </div>
        </form>
      </Modal>

      <div className="">
        <div className="flex justify-between items-center  border-b pb-1">
          <div>
            <p className="font-bold">Phone Categories Management</p>
            {isCategoriesError && (
              <p className="text-red-600 text-sm mt-1 flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.351 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                Unable to load categories
              </p>
            )}
          </div>
          <button
            onClick={() => {
              addOpen();
            }}
            disabled={loadingAddCategory || isCategoriesError}
            className="bg-primary disabled:cursor-not-allowed disabled:bg-gray-400 text-light px-4 rounded-md transition-colors duration-200"
          >
            Add Category
          </button>
        </div>

        <div className="">
          <h1 className="capitalize">Added categories </h1>
          <div className="overflow-x-auto overflow-y-auto mt-2  relative bg-white">
            <table className="w-full text-sm text-left text-gray-500 border">
              <thead className="text-xs  bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="py-1 px-1  text-gray-900 whitespace-nowrap"
                  >
                    #
                  </th>
                  <th scope="col" className="py-1 px-1">
                    Category Name
                  </th>
                  <th scope="col" className="py-1 px-1">
                    Description
                  </th>
                  <th scope="col" className="py-1 px-1 text-center">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="">
                {loadingCategories ? (
                  <tr className="">
                    <td colSpan={4} className="py-3 ">
                      <h1 className="text-center text-lg font-bold text-primary">
                        Loading...
                      </h1>
                    </td>
                  </tr>
                ) : isCategoriesError ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="text-red-500">
                        <svg
                          className="mx-auto h-12 w-12 text-red-400 mb-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8V4m0 4v4m0 0v4m0-4h4m-4 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="text-lg font-medium">
                          Failed to load categories
                        </p>
                        <p className="text-sm text-red-400 mt-1">
                          {categoriesError?.response?.data?.message ||
                            categoriesError?.message ||
                            "Unable to fetch data from server"}
                        </p>
                        <button
                          onClick={() =>
                            queryClient.invalidateQueries(["categories"])
                          }
                          className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors duration-200"
                        >
                          Try Again
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : categoriesData?.data?.message ||
                  !categoriesData?.data?.categories ||
                  !Array.isArray(categoriesData?.data?.categories) ||
                  categoriesData?.data?.categories?.length < 1 ? (
                  <tr>
                    <td colSpan={4} className="text-gray-800 text-center py-3">
                      {categoriesData?.data?.message ||
                        "No phone categories added"}
                    </td>
                  </tr>
                ) : (
                  categoriesData?.data?.categories?.map((item, index) => {
                    return (
                      <tr
                        key={item?._id || index}
                        className="odd:bg-gray-50 text-dark hover:bg-gray-100 py-2"
                      >
                        <td className="border-collapse  border-slate-500 py-1 px-3">
                          {index + 1}
                        </td>

                        <td className="border-collapse  border-slate-500 py-1 px-3 font-semibold">
                          {item?.name || "N/A"}
                        </td>
                        <td className="border-collapse  border-slate-500 py-1 px-3 max-w-xs">
                          <div
                            className="truncate"
                            title={item?.description || ""}
                          >
                            {item?.description || "No description"}
                          </div>
                        </td>
                        <td className="border-collapse text-center  gap-3 border-slate-500 py-1 px-3">
                          <span
                            onClick={() => {
                              setCategoryId(item?._id || "");
                              setCategoryName(item?.name || "");
                              setNewDescription(item?.description || "");
                              setNewName(item?.name || "");
                              editOpen();
                            }}
                            className="px-3 py-2 bg-dark mx-1 text-light rounded-md cursor-pointer bg-opacity-90 hover:bg-opacity-100 "
                          >
                            Edit
                          </span>

                          <span
                            onClick={() => {
                              setCategoryId(item?._id || "");
                              setCategoryName(item?.name || "");
                              open();
                            }}
                            className="px-3 py-2 bg-red-500 mx-2 text-light rounded-md cursor-pointer bg-opacity-90 hover:bg-opacity-100 "
                          >
                            Delete
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="overflow-x-auto mb-3"></div>
      </div>
    </div>
  );
}

export default PhoneCategories;
