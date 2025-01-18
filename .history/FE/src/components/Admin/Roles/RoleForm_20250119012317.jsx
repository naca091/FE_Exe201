import React, { useState, useEffect } from "react";
import { Form, Input, Button, message } from "antd";

const RoleForm = ({ initialValues, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const endpoint = initialValues
        ? `${API_URL}/roles/${initialValues.id}`
        : `${API_URL}/roles`;

      const method = initialValues ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          id: Number(values.id), // Ensure ID is a number
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Unknown error occurred");
      }

      message.success(
        initialValues ? "Role updated successfully" : "Role created successfully"
      );
      form.resetFields();
      if (onSuccess) {
        onSuccess(); // Trigger callback after success
      }
    } catch (error) {
      message.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      onFinish={handleSubmit}
      layout="vertical"
      initialValues={initialValues}
    >
      <Form.Item
        name="name"
        label="Role Name"
        rules={[{ required: true, message: "Please input the role name!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="id"
        label="Role ID"
        rules={[{ required: true, message: "Please input the role ID!" }]}
      >
        <Input type="number" disabled={!!initialValues} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          {initialValues ? "Update Role" : "Create Role"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default RoleForm;
