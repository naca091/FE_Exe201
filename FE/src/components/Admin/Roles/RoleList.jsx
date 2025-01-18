import React, { useState, useEffect } from "react";
import { Table, Button, Space, message, Popconfirm, Modal } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import RoleForm from "./RoleForm";

const RoleList = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [saving, setSaving] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || "https://demcalo.onrender.com/api";

  // Fetch roles
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/roles`);
      const rolesData = response.data?.data || [];
      setRoles(
        rolesData.map((role) => ({
          ...role,
          key: role._id,
        }))
      );
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Delete role
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/roles/${id}`);
      message.success("Role deleted successfully");
      fetchRoles();
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to delete role");
    }
  };

  // Save role (Create or Update)
  const handleSave = async (values) => {
    setSaving(true);
    try {
      if (editingRole) {
        // Update role
        await axios.put(`${API_URL}/roles/${editingRole.id}`, values);
        message.success("Role updated successfully");
      } else {
        // Create role
        await axios.post(`${API_URL}/roles`, values);
        message.success("Role created successfully");
      }
      fetchRoles();
      handleModalClose();
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to save role");
    } finally {
      setSaving(false);
    }
  };

  // Edit role
  const handleEdit = (record) => {
    setEditingRole(record);
    setIsModalVisible(true);
  };

  // Close modal
  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingRole(null);
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
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this role?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Role Management</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          Add Role
        </Button>
      </div>

      <Table columns={columns} dataSource={roles} rowKey="key" loading={loading} />

      <Modal
        visible={isModalVisible}
        title={editingRole ? "Edit Role" : "Add Role"}
        onCancel={handleModalClose}
        footer={null}
        destroyOnClose
      >
        <RoleForm
          initialValues={editingRole}
          onSuccess={handleSave}
          saving={saving}
        />
      </Modal>
    </div>
  );
};

export default RoleList;
