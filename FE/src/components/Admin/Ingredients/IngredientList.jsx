import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Upload,
  message,
  Space,
  InputNumber,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL || "https://demcalo.onrender.com";

const { Option } = Select;

const MenuForm = ({ visible, onCancel, onSuccess, initialValues }) => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    // Fetch categories and ingredients for dropdowns
    const fetchData = async () => {
      try {
        const categoriesResponse = await axios.get(`${API_URL}/categories`);
        setCategories(categoriesResponse.data.data);

        const ingredientsResponse = await axios.get(`${API_URL}/ingredients`);
        setIngredients(ingredientsResponse.data.data);
      } catch (error) {
        message.error("Failed to fetch data");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    // Transform initialValues for form if they exist
    if (initialValues) {
      const transformedValues = {
        ...initialValues,
        cookingTimePrep: initialValues.cookingTime?.prep,
        cookingTimeCook: initialValues.cookingTime?.cook,
      };
      form.setFieldsValue(transformedValues);
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      let imageUrl = values.image;

      // Check for new file upload
      if (fileList.length > 0 && fileList[0].originFileObj) {
        const formData = new FormData();
        formData.append("image", fileList[0].originFileObj);

        // Upload image
        const uploadResponse = await axios.post(`${API_URL}/menus/upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (uploadResponse.data.success) {
          imageUrl = uploadResponse.data.filePath;
        } else {
          throw new Error("Failed to upload image");
        }
      } else if (!initialValues?.image) {
        // No image provided in add mode
        message.error("Please upload an image!");
        setLoading(false);
        return;
      }

      // Prepare menu data
      const menuData = {
        ...values,
        image: imageUrl,
        cookingTime: {
          prep: values.cookingTimePrep,
          cook: values.cookingTimeCook,
        },
      };

      // Send menu data
      if (initialValues && initialValues._id) {
        await axios.put(`${API_URL}/menus/${initialValues._id}`, menuData);
        message.success("Menu updated successfully");
      } else {
        await axios.post(`${API_URL}/menus`, menuData);
        message.success("Menu added successfully");
      }

      setFileList([]);
      form.resetFields();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  return (
    <Modal
      title={initialValues ? "Edit Menu" : "Add New Menu"}
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialValues}
      >
        {/* Add your Form Items here (same as the original) */}
      </Form>
    </Modal>
  );
};

export default MenuForm;
