import React, { useEffect } from 'react';
import { Modal, Form, Input, message, Spin } from 'antd';
import axios from 'axios';

const IngredientForm = ({ visible, onCancel, onSuccess, initialValues }) => {
  const [form] = Form.useForm();
  const isEditing = !!initialValues?._id;
  const [loading, setLoading] = React.useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'https://demcalo.onrender.com';

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
      }
    }
  }, [visible, initialValues, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (isEditing) {
        // Gọi API cập nhật
        await axios.put(`${API_URL}/api/ingredients/${initialValues._id}`, values);
        message.success('Ingredient updated successfully');
      } else {
        // Gọi API thêm mới
        await axios.post(`${API_URL}/api/ingredients`, values);
        message.success('Ingredient added successfully');
      }
      form.resetFields();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error details:', error.response?.data);
      const errorMsg = error.response?.data?.message || 'Operation failed';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEditing ? 'Edit Ingredient' : 'Add New Ingredient'}
      open={visible}
      onCancel={() => {
        form.resetFields();
        if (onCancel) onCancel();
      }}
      onOk={() => form.submit()}
      confirmLoading={loading}
      destroyOnClose
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={initialValues}
        >
          <Form.Item
            name="name"
            label="Ingredient Name"
            rules={[
              { required: true, message: 'Please input the ingredient name!' },
              { min: 2, message: 'Name must be at least 2 characters long' },
            ]}
          >
            <Input placeholder="Enter ingredient name" />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default IngredientForm;
