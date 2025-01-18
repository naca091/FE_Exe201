import React, { Component } from 'react';
import { Modal, Form, Input, Select, InputNumber, message, Switch } from 'antd';
import axios from 'axios';

// Define the API URL constant
const API_URL = 'https://demcalo.onrender.com/api';

const { Option } = Select;

class UserForm extends Component {
  formRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      roles: [],
      loading: false,
      users: [],
    };
  }

  componentDidMount() {
    this.fetchRoles();
    if (this.props.visible) {
      this.setInitialValues();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.visible && !prevProps.visible) {
      this.fetchRoles();
      this.setInitialValues();
    }
  }

  fetchRoles = async () => {
    try {
      const response = await axios.get(`${API_URL}/roles`);
      if (response.data.success) {
        this.setState({ roles: response.data.data });
      }
    } catch (error) {
      message.error('Failed to fetch roles');
    }
  };

  setInitialValues = () => {
    const { initialValues } = this.props;
    if (this.formRef.current) {
      if (initialValues) {
        this.formRef.current.setFieldsValue({
          ...initialValues,
          isActive: initialValues.isActive || true,
        });
      } else {
        this.formRef.current.resetFields();
      }
    }
  };

  handleSubmit = async (values) => {
    const { onSuccess, initialValues } = this.props;
    const isEditing = !!initialValues?._id;
    this.setState({ loading: true });

    try {
      if (isEditing) {
        await axios.put(`${API_URL}/users/${initialValues._id}`, values);
        message.success('User updated successfully');
      } else {
        await axios.post(`${API_URL}/users`, values);
        message.success('User added successfully');
      }
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error details:', error.response?.data);
      message.error(error.response?.data?.message || 'Operation failed');
    } finally {
      this.setState({ loading: false });
    }
  };

  handleCancel = () => {
    const { onCancel } = this.props;
    if (this.formRef.current) {
      this.formRef.current.resetFields();
    }
    if (onCancel) onCancel();
  };

  render() {
    const { visible, initialValues } = this.props;
    const { roles, loading } = this.state;
    const isEditing = !!initialValues?._id;

    return (
      <Modal
        title={isEditing ? 'Edit User' : 'Add New User'}
        open={visible}
        onCancel={this.handleCancel}
        onOk={() => this.formRef.current.submit()}
        confirmLoading={loading}
        width={800}
        destroyOnClose
      >
        <Form
          ref={this.formRef}
          layout="vertical"
          onFinish={this.handleSubmit}
          initialValues={{ isActive: true, ...initialValues }}
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[
              { required: true, message: 'Username is required' },
              { min: 4, message: 'Username must be at least 4 characters' },
              { max: 20, message: 'Username cannot exceed 20 characters' },
              {
                pattern: /^[a-zA-Z0-9_]+$/,
                message: 'Username can only contain letters, numbers, and underscores',
              },
            ]}
          >
            <Input />
          </Form.Item>

          {!isEditing && (
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Password is required' },
                { min: 6, message: 'Password must be at least 6 characters' },
              ]}
            >
              <Input.Password />
            </Form.Item>
          )}

          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[
              { required: true, message: 'Full name is required' },
              { min: 2, message: 'Name must be at least 2 characters' },
              { max: 50, message: 'Name cannot exceed 50 characters' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Please provide a valid email' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[
              {
                pattern: /^(\+84|84|0)?[1-9]\d{8,9}$/,
                message: 'Please provide a valid phone number',
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="address"
            label="Address"
            rules={[{ max: 200, message: 'Address cannot exceed 200 characters' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Role is required' }]}
          >
            <Select placeholder="Select a role">
              {roles?.map((role) => (
                <Option key={role._id} value={role._id}>
                  {role.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="xu" label="Xu">
            <InputNumber min={0} />
          </Form.Item>

          <Form.Item name="avatar" label="Avatar URL">
            <Input placeholder="Enter avatar URL" />
          </Form.Item>

          <Form.Item name="isActive" label="Is Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export default UserForm;
