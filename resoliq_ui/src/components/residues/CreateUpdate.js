import React, { useContext, useEffect } from "react";
import { Card, Form, Input, Button, Modal, notification, Tag } from "antd";
import { WasteContext } from "../../containers/Waste";
import {
  PlusCircleFilled,
  ClearOutlined,
  RetweetOutlined,
  MinusCircleFilled,
} from "@ant-design/icons";
import api from "../../api/endpoints";

const CreateUpdate = () => {
  const { state, dispatch } = useContext(WasteContext);
  const [form] = Form.useForm();

  function createOrClear() {
    if (state.select_to_edit) {
      dispatch({
        type: "select_to_edit",
        payload: { residue: null },
      });
      form.resetFields();
    } else {
      form.resetFields();
    }
  }

  async function createResidue(values) {
    await api.residues
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
            "Errores al crear el nuevo punto, revisa tus datos ingresados.",
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

  async function updateResidue(values) {
    if (state.add_quantity || state.sus_quantity) {
      if (state.add_quantity) {
        values.quantity =
          parseFloat(state.select_to_edit.quantity) +
          parseFloat(values.quantity);
        console.log(values.quantity);
        console.log(state.select_to_edit.quantity);
        const register = api.register_residues.create({
          residue: state.select_to_edit.id,
          quantity: values.quantity - state.select_to_edit.quantity,
        });
      } else {
        values.quantity =
          parseFloat(state.select_to_edit.quantity) -
          parseFloat(values.quantity);
        const register = api.register_residues.create({
          residue: state.select_to_edit.id,
          quantity: values.quantity - state.select_to_edit.quantity,
        });
      }
    }
    await api.residues
      .update(state.select_to_edit.id, values)
      .then(() => {
        dispatch({
          type: "update_list",
        });
        dispatch({ type: "select_to_edit", payload: { residue: null } });
        form.resetFields();
        notification.success({ message: "Cliente actualizado correctamente." });
      })
      .catch((e) => {
        const errors = e.response.data;
        const errorList = Object.keys(errors).map((key) => errors[key]);
        Modal.error({
          title: "Errores al actualizar al cliente.",
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
      notification.success({ message: "Cliente actualizado correctamente." });
      dispatch({ type: "select_to_edit", payload: { residue: null } });
      form.resetFields();
    }
  }

  function createOrUpdateResidue(values) {
    if (state.select_to_edit) {
      updateResidue(values);
    } else {
      createResidue(values);
    }
  }

  useEffect(() => {
    if (state.select_to_edit) {
      form.setFieldsValue(state.select_to_edit);
    }
    if (state.add_quantity || state.sus_quantity) {
      form.setFieldValue("quantity", parseFloat(0));
    }
  }, [state.select_to_edit]);

  return (
    <Card
      hoverable
      title={
        state.select_to_edit ? (
          <>
            {state.add_quantity || state.sus_quantity ? (
              state.add_quantity ? (
                `Agregar existencias a ${state.select_to_edit.name}`
              ) : (
                `Retirar existencias a ${state.select_to_edit.name}`
              )
            ) : (
              <Tag color="blue-inverse">
                Actualizando: {state.select_to_edit.name}
              </Tag>
            )}
          </>
        ) : (
          "Crear nuevo punto"
        )
      }
    >
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 8 }}
        labelWrap={true}
        onFinish={createOrUpdateResidue}
      >
        {!state.add_quantity && !state.sus_quantity && (
          <>
            <Form.Item
              label="Punto"
              name="name"
              rules={[{ required: true, message: "Ingresa el nombre" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Descripción"
              name="type_medition"
              rules={[{ required: true, message: "Ingresa la medida" }]}
            >
              <Input />
            </Form.Item>
          </>
        )}
        {(state.add_quantity || state.sus_quantity) && (
          <Form.Item
            label="Cantidad"
            name="quantity"
            rules={[{ required: true, message: "Ingresa la cantidad" }]}
          >
            <Input />
          </Form.Item>
        )}

        <Form.Item style={{ float: "right" }}>
          <Button
            htmlType="submit"
            type="primary"
            style={{
              marginRight: "10px",
            }}
            icon={
              state.select_to_edit ? (
                state.add_quantity || state.sus_quantity ? (
                  state.add_quantity ? (
                    <PlusCircleFilled />
                  ) : (
                    <MinusCircleFilled />
                  )
                ) : (
                  <RetweetOutlined />
                )
              ) : (
                <PlusCircleFilled />
              )
            }
          >
            {state.select_to_edit ? (
              <>
                {state.add_quantity || state.sus_quantity
                  ? state.add_quantity
                    ? `Agregar`
                    : `Retirar`
                  : `Actualizar`}
              </>
            ) : (
              "Crear"
            )}
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
