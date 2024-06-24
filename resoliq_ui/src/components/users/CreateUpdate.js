import React, { useContext, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Modal,
  notification,
  Tag,
} from "antd";
import { UsersContext } from "../../containers/Users";
import {
  PlusCircleFilled,
  ClearOutlined,
  RetweetOutlined,
} from "@ant-design/icons";
import api from "../../api/endpoints";
import { type } from "@testing-library/user-event/dist/type";

const CreateUpdate = () => {
  const { state, dispatch } = useContext(UsersContext);
  const [form] = Form.useForm();

  function createOrClear() {
    if (state.select_to_edit) {
      dispatch({
        type: "select_to_edit",
        payload: { user: null },
      });
      form.resetFields();
    } else {
      form.resetFields();
    }
  }

  async function createUser(values) {
    await api.users
      .create(values)
      .then(() => {
        dispatch({
          type: "update_list",
        });
        form.resetFields();
      })
      .catch((e) => {
        const errors = e.response.data;
        const errorList = Object.keys(errors).map((key) => errors[key]);
        Modal.error({
          title:
            "Errores al crear el nuevo usuario, revisa tus datos ingresados.",
          content: (
            <ul>
              {errorList.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          ),
        });
      });
  }

  async function updateUser(values) {
    await api.users
      .update(state.select_to_edit, values)
      .then(() => {
        dispatch({
          type: "update_list",
        });
      })
      .catch((e) => {
        const errors = e.response.data;
        const errorList = Object.keys(errors).map((key) => errors[key]);
        Modal.error({
          title: "Errores al actualizar el usuario.",
          content: (
            <ul>
              {errorList.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          ),
        });
      });
    if (values.password) {
      if (values.password === values.password_validation) {
        await api.users
          .change_password({
            user: state.select_to_edit.email,
            new_password: values.password,
          })
          .then(() => {
            form.resetFields();
            notification.success({
              message: "Contraseña y datos actualizada correctamente",
            });
            dispatch({ type: "select_to_edit", payload: { user: null } });
            form.resetFields();
          });
      } else {
        Modal.error({
          title: "ERROR",
          content: "Las contraseñas no coinciden, verifica e intenta de nuevo.",
        });
      }
    } else {
      notification.success({ message: "Usuario actualizado correctamente." });
      dispatch({ type: "select_to_edit", payload: { user: null } });
      form.resetFields();
    }
  }

  function createOrUpdateUser(values) {
    if (state.select_to_edit) {
      updateUser(values);
    } else {
      if (values.password === values.password_validation) {
        const cleanEmail = values.email
          .split("@")[0]
          .replace(/[^a-zA-Z0-9]/g, "");
        values = { ...values, username: cleanEmail };
        createUser(values);
      } else {
        Modal.error({
          title: "ERROR",
          content: "Las contraseñas no coinciden, verifica e intenta de nuevo.",
        });
      }
    }
  }

  useEffect(() => {
    if (state.select_to_edit) {
      form.setFieldsValue(state.select_to_edit);
    }
  }, [state.select_to_edit]);

  return (
    <Card
      hoverable
      title={
        state.select_to_edit ? (
          <>
            <Tag color="blue-inverse">{state.select_to_edit.email}</Tag>
          </>
        ) : (
          "Crear nuevo usuario"
        )
      }
    >
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 8 }}
        labelWrap={true}
        onFinish={createOrUpdateUser}
      >
        <Form.Item
          label="Nombre"
          name="first_name"
          rules={[{ required: true, message: "Ingresa el nombre" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Apellido"
          name="last_name"
          rules={[{ required: true, message: "Ingresa el apellido" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: "Ingresa tu email" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Rut"
          name="dni"
          rules={[{ required: true, message: "Ingresa tu email" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Tipo Usuario"
          name="type_user"
          rules={[{ required: true, message: "Selecciona un tipo de usuario" }]}
        >
          <Select placeholder="Selecciona una opción">
            <Select.Option value="SWR">Software</Select.Option>
            <Select.Option value="HWR">Hardware</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          label={state.select_to_edit ? "Nueva contraseña" : "Contraseña"}
          name="password"
          rules={[
            {
              required: state.select_to_edit ? false : true,
              message: "Ingresa la contraseña",
            },
          ]}
        >
          <Input type="password" />
        </Form.Item>

        <Form.Item
          label={"Confirmación de contraseña"}
          name="password_validation"
          rules={[
            {
              required: state.select_to_edit ? false : true,
              message: "Ingresa la confirmación de contraseña",
            },
          ]}
        >
          <Input type="password" />
        </Form.Item>
        <Form.Item style={{ float: "right" }}>
          <Button
            htmlType="submit"
            type="primary"
            style={{
              marginRight: "10px",
            }}
            icon={
              state.select_to_edit ? <RetweetOutlined /> : <PlusCircleFilled />
            }
          >
            {state.select_to_edit ? "Actualizar" : "Crear"}
          </Button>
          <Button
            onClick={createOrClear}
            icon={
              state.select_to_edit ? <PlusCircleFilled /> : <ClearOutlined />
            }
          >
            {state.select_to_edit ? "Crear nuevo" : "Limpiar"}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CreateUpdate;
