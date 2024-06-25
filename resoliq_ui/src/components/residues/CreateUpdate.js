import React, { useContext, useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Modal,
  notification,
  Tag,
  Select,
} from "antd";
import { WasteContext } from "../../containers/Waste";
import {
  PlusCircleFilled,
  ClearOutlined,
  RetweetOutlined,
  MinusCircleFilled,
} from "@ant-design/icons";
import api, { list_orders } from "../../api/endpoints";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";

const CreateUpdate = () => {
  dayjs.locale("es");
  dayjs.extend(weekday);
  dayjs.extend(localeData);
  const { state, dispatch } = useContext(WasteContext);
  const [form] = Form.useForm();
  const [clients, setClients] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [residues, setResidues] = useState([]);
  const [detailResiduals, setDetailResiduals] = useState([]);
  const [listPreSelect, setListPreSelect] = useState({});

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

  async function createOrder(values) {
    let validatedList = [];
    const clonedDetailResiduals = detailResiduals.reduce((acc, cur) => {
      const existingResidual = acc.find(
        (residual) => residual.residue === cur.residue.id
      );
      if (existingResidual) {
        existingResidual.quantity += cur.quantity;
      } else {
        acc.push({
          residue: cur.residue.id,
          quantity: cur.quantity,
          quantity_res: parseInt(cur.residue.quantity + cur.quantity),
        });
      }
      return acc;
    }, []);

    for (const detail of clonedDetailResiduals) {
      const rq = await api.register_residues.create(detail).then((res) => {
        validatedList.push(res.id);
      });
    }

    values = {
      ...values,
      date: values.date.format("YYYY-MM-DD"),
      registers: validatedList,
    };
    await api.orders
      .create(values)
      .then(async () => {
        dispatch({
          type: "update_list",
        });
        form.resetFields();
        const updateQuantity = await Promise.all(
          clonedDetailResiduals.map(async (register) => {
            console.log(register);
            const rq = await api.residues.update(register.residue, {
              quantity: register.quantity_res,
            });
            console.log(rq);
          })
        );
        setListPreSelect({});
        setDetailResiduals([]);
      })
      .catch((e) => {
        console.log(e);
        const errors = e.response?.data;
        const errorList = Object.keys(errors).map((key) => errors[key]);
        Modal.error({
          title:
            "Errores al crear la nueva orden, revisa tus datos ingresados.",
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

  async function updateOrder(values) {
    let validatedList = [];
    const clonedDetailResiduals = detailResiduals.reduce((acc, cur) => {
      const existingResidual = acc.find(
        (residual) => residual.residue.residual === cur.residue.id
      );
      if (existingResidual) {
        existingResidual.residue.quantity += cur.quantity;
      } else {
        acc.push({
          residue: cur.residue.id,
          quantity: cur.quantity,
        });
      }
      return acc;
    }, []);

    for (const detail of clonedDetailResiduals) {
      const rq = await api.register_residues.create(detail).then((res) => {
        validatedList.push(res.id);
      });
    }

    values = {
      ...values,
      date: values.date.format("YYYY-MM-DD"),
      registers: validatedList,
    };
    await api.orders
      .update(state.select_to_edit.id, values)
      .then(() => {
        dispatch({
          type: "update_list",
        });
        dispatch({ type: "select_to_edit", payload: { order: null } });
        form.resetFields();
        setListPreSelect({});
        setDetailResiduals([]);
        notification.success({
          message: "Orden actualizado correctamente.",
        });
      })
      .catch((e) => {
        const errors = e.response.data;
        const errorList = Object.keys(errors).map((key) => errors[key]);
        Modal.error({
          title: "Errores al actualizar la Orden.",
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

  const getClient = async () => {
    const pageSize = 10; // Número de elementos por página
    let currentPage = 1; // Página actual
    let allData = []; // Array para almacenar todos los datos

    // Función para obtener los datos de una página específica
    const getDataPage = async (page) => {
      const rq = await api.clients.list(page);
      return rq.results;
    };

    // Obtener los datos de la primera página
    let pageData = await getDataPage(currentPage);
    allData = allData.concat(pageData);

    // Obtener los datos de las páginas r antes
    while (pageData.length === pageSize) {
      currentPage++;
      pageData = await getDataPage(currentPage);
      allData = allData.concat(pageData);
    }
    setClients(allData);
  };

  const getDrivers = async () => {
    const pageSize = 10; // Número de elementos por página
    let currentPage = 1; // Página actual
    let allData = []; // Array para almacenar todos los datos

    // Función para obtener los datos de una página específica
    const getDataPage = async (page) => {
      const rq = await api.drivers.list(page);
      return rq.results;
    };

    // Obtener los datos de la primera página
    let pageData = await getDataPage(currentPage);
    allData = allData.concat(pageData);

    // Obtener los datos de las páginas restantes
    while (pageData.length === pageSize) {
      currentPage++;
      pageData = await getDataPage(currentPage);
      allData = allData.concat(pageData);
    }
    setDrivers(allData);
  };

  const getResidues = async () => {
    const pageSize = 10; // Número de elementos por página
    let currentPage = 1; // Página actual
    let allData = []; // Array para almacenar todos los datos

    // Función para obtener los datos de una página específica
    const getDataPage = async (page) => {
      const rq = await api.residues.list(page);
      return rq.results;
    };

    // Obtener los datos de la primera página
    let pageData = await getDataPage(currentPage);
    allData = allData.concat(pageData);

    // Obtener los datos de las páginas restantes
    while (pageData.length === pageSize) {
      currentPage++;
      pageData = await getDataPage(currentPage);
      allData = allData.concat(pageData);
    }
    setResidues(allData);
  };

  useEffect(() => {
    getClient();
    getDrivers();
    getResidues();
    if (state.select_to_edit) {
      form.setFieldsValue(state.select_to_edit);
      form.setFieldValue("date", dayjs(state.select_to_edit.date));
      form.setFieldValue("client", state.select_to_edit.client.id);
      form.setFieldValue("driver", state.select_to_edit.driver.id);
      form.setFieldValue("is_reposition", state.select_to_edit.is_reposition);
      setDetailResiduals(state.select_to_edit.registers);
    } else {
      form.setFieldValue("is_reposition", false);
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
              label="Cliente"
              name="driver"
              rules={[{ required: true, message: "Selecciona un cliente" }]}
            >
              <Select
                placeholder={`Selecciona un cliente`}
                style={{ width: `100%` }}
              >
                {drivers.map((driver) => (
                  <Select.Option key={driver.id} value={driver.id}>
                    {driver.name}({driver.dni})
                  </Select.Option>
                ))}
              </Select>
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
