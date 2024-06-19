import React, { useContext, useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Modal,
  notification,
  Tag,
  DatePicker,
  InputNumber,
  Row,
  Col,
  Select,
} from "antd";
import { OrdersContext } from "../../containers/Orders";
import {
  PlusCircleFilled,
  ClearOutlined,
  PlusCircleOutlined,
  DeleteOutlined,
  RetweetOutlined,
} from "@ant-design/icons";
import api, { list_orders } from "../../api/endpoints";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";

const CreateUpdate = () => {
  dayjs.locale("es");
  dayjs.extend(weekday);
  dayjs.extend(localeData);

  const { state, dispatch } = useContext(OrdersContext);
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
        payload: { driver: null },
      });
      setListPreSelect({});
      setDetailResiduals([]);
      form.resetFields();
    } else {
      form.resetFields();
    }
  }

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
        const udpdateQuantity = await Promise.all(
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

  function createOrUpdateOrder(values) {
    if (state.select_to_edit) {
      updateOrder(values);
    } else {
      createOrder(values);
    }
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

    // Obtener los datos de las páginas restantes
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
            <Tag color="blue">{state.select_to_edit.id}</Tag>
          </>
        ) : (
          "Crear nuevo diagnostico"
        )
      }
    >
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 8 }}
        labelWrap={true}
        onFinish={createOrUpdateOrder}
      >
        <Form.Item
          label="Fecha"
          name="date"
          rules={[{ required: true, message: "Ingresa la fecha" }]}
        >
          <DatePicker
            placeholder="Selecciona una fecha"
            style={{ width: `100%` }}
            format="YYYY-MM-DD"
          />
        </Form.Item>
        <Form.Item
          label="Cliente"
          name="client"
          rules={[{ required: true, message: "Selecciona un cliente" }]}
        >
          <Select
            placeholder={`Selecciona un cliente`}
            style={{ width: `100%` }}
          >
            {clients.map((client) => (
              <Select.Option key={client.id} value={client.id}>
                {client.name}({client.dni})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Punto de Captación"
          name="driver"
          rules={[{ required: true, message: "Selecciona un punto" }]}
        >
          <Select placeholder={`Selecciona un punto`} style={{ width: `100%` }}>
            {drivers.map((driver) => (
              <Select.Option key={driver.id} value={driver.id}>
                {driver.name} - {driver.vehicle_plate}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <hr />
        <Form.Item label="Observaciones" name="observation">
          <Input.TextArea placeholder="Describe..." />
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
