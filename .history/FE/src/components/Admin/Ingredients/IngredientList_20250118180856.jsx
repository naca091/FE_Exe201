import React, { useState, useEffect } from "react";
import { Table, Button, Space, message, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import IngredientForm from "./IngredientForm";

const IngredientList = () => {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);

  // Fetch ingredients
  const fetchIngredients = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://demcalo.onrender.com/api/ingredients");
      const data = Array.isArray(response.data?.data)
        ? response.data.data.map((item) => ({ ...item, key: item.id }))
        : [];
      setIngredients(data);
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to fetch ingredients"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  // Delete ingredient
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/ingredients/${id}`);
      message.success("Ingredient deleted successfully");
      fetchIngredients();
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to delete ingredient"
      );
    }
  };

  // Edit ingredient
  const handleEdit = (record) => {
    setEditingIngredient(record);
    setIsModalVisible(true);
  };

  // Close modal
  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingIngredient(null);
  };

  // Table columns
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm
            title="Are you sure you want to delete this ingredient?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Ingredients Management</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          Add Ingredient
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={ingredients}
        rowKey="id"
        loading={loading}
      />

      <IngredientForm
        visible={isModalVisible}
        onCancel={handleModalClose}
        onSuccess={() => {
          handleModalClose();
          fetchIngredients();
        }}
        initialValues={editingIngredient}
      />
    </div>
  );
};

export default IngredientList;
