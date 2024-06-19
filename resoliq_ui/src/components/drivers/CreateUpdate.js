import React, { useContext, useEffect } from "react";
import { Card, Form, Input, Button, Modal, notification, Tag } from "antd";
import { DriversContext } from "../../containers/DriversTrucks";
import {
  PlusCircleFilled,
  ClearOutlined,
  RetweetOutlined,
  MinusCircleFilled,
} from "@ant-design/icons";
import api from "../../api/endpoints";

const CreateUpdate = () => {
  const { state, dispatch } = useContext(DriversContext);
  const [form] = Form.useForm();

  function createOrClear() {
    if (state.select_to_edit) {
      dispatch({
        type: "select_to_edit",
        payload: { driver: null },
      });
      form.resetFields();
    } else {
      form.resetFields();
    }
  }

  async function createDriver(values) {
    await api.drivers
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
            "Errores al crear el nuevo Punto, revisa tus datos ingresados.",
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

  async function updateDriver(values) {
    await api.drivers
      .update(state.select_to_edit.id, values)
      .then(() => {
        dispatch({
          type: "update_list",
        });
        dispatch({ type: "select_to_edit", payload: { driver: null } });
        form.resetFields();
        notification.success({
          message: "Punto actualizado correctamente.",
        });
      })
      .catch((e) => {
        const errors = e.response.data;
        const errorList = Object.keys(errors).map((key) => errors[key]);
        Modal.error({
          title: "Errores al actualizar el punto.",
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

  function createOrUpdateDriver(values) {
    if (state.select_to_edit) {
      updateDriver(values);
    } else {
      createDriver(values);
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
            <Tag color="blue">{state.select_to_edit.name}</Tag>
          </>
        ) : (
          "Crear nuevo Punto"
        )
      }
    >
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 8 }}
        labelWrap={true}
        onFinish={createOrUpdateDriver}
      >
        <Form.Item
          label="Nombre"
          name="name"
          rules={[{ required: true, message: "Ingresa el nombre" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Rut"
          name="dni"
          rules={[{ required: true, message: "Ingresa el rut" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Patente"
          name="vehicle_plate"
          rules={[{ required: true, message: "Ingresa la patente" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Telefono"
          name="phone_number"
          rules={[{ required: true, message: "Ingresa la patente" }]}
        >
          <Input />
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
            {state.select_to_edit ? `Actualizar` : "Crear"}
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
