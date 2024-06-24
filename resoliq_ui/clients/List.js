import React, { useContext, useEffect } from "react";
import { Table, Button, Row, Col, Popconfirm, notification } from "antd";
import api from "../../api/endpoints";
import { ClientsContext } from "../../containers/Clients";
import {
  DeleteFilled,
  RightCircleFilled,
  FileExcelFilled,
} from "@ant-design/icons";
import * as XLSX from "xlsx";

const List = () => {
  const { state, dispatch } = useContext(ClientsContext);

  async function getClients() {
    await api.clients.list(state.list.page).then((x) => {
      dispatch({
        type: "add_clients",
        payload: x,
      });
    });
  }

  const selectClient = (client) => {
    dispatch({
      type: "select_to_edit",
      payload: { client },
    });
  };

  const deleteCliennt = async (client) => {
    const response = await api.clients.delete(client.id).then(() => {
      dispatch({
        type: "update_list",
      });
      dispatch({
        type: "change_page",
        page: 1,
      });
      notification.success({ message: "Cliente eliminado" });
    });
  };

  const downloadDataToExcel = async () => {
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

    // Dividir los datos en lotes más pequeños

    const filteredData = allData.map((item) => ({
      Nombre: item.name,
      Rut: item.dni,
      Telefono: item.phone_number,
      Email: item.address,
    }));

    // Crear el archivo Excel y descargarlo
    const worksheet = XLSX.utils.json_to_sheet(filteredData);

    // Set column widths based on the length of the title text
    const columnWidths = Object.keys(worksheet).reduce((widths, cell) => {
      const column = cell.replace(/[0-9]/g, "");
      const value = worksheet[cell].v;
      const length = value ? value.toString().length : 10; // Default width if value is empty
      widths[column] = Math.max(widths[column] || 0, length);
      return widths;
    }, {});

    // Apply column widths to the worksheets
    worksheet["!cols"] = Object.keys(columnWidths).map((column) => ({
      wch: columnWidths[column],
    }));

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");

    // Función para aplicar estilos a las celdas
    const applyStyles = (worksheet, range, style) => {
      const { s, e } = XLSX.utils.decode_range(range);
      for (let row = s.r; row <= e.r; row++) {
        for (let col = s.c; col <= e.c; col++) {
          const cell = XLSX.utils.encode_cell({ r: row, c: col });
          if (!worksheet[cell]) {
            worksheet[cell] = {};
          }
          worksheet[cell].s = style;
        }
      }
    };

    // Crear estilos para las celdas
    const borderStyle = {
      border: {
        top: { style: "thin", color: { rgb: "00000000" } },
        bottom: { style: "thin", color: { rgb: "00000000" } },
        left: { style: "thin", color: { rgb: "00000000" } },
        right: { style: "thin", color: { rgb: "00000000" } },
      },
    };

    const headerStyle = {
      fill: { fgColor: { rgb: "00000000" } },
      font: { color: { rgb: "FFFFFFFF" } },
    };

    // Aplicar estilos a las celdas con datos
    applyStyles(worksheet, "A1:Z1000", borderStyle);

    // Aplicar estilo a la primera fila
    applyStyles(worksheet, "A1:Z1", headerStyle);

    XLSX.writeFile(workbook, `listado_clientes.xlsx`);
  };

  const columns = [
    {
      title: "Nombre",
      dataIndex: "name",
    },
    { title: `Rut`, dataIndex: `dni` },
    { title: `Telefono`, dataIndex: `phone_number` },
    { title: `Email`, dataIndex: `address` },
    {
      width: "35%",
      render: (x) => (
        <Row justify={"space-between"}>
          <Col span={12}>
            <Popconfirm
              title={"Estas seguro de eliminar el residuo?"}
              onConfirm={() => deleteCliennt(x)}
            >
              <Button
                style={{ marginRight: "10px" }}
                type="primary"
                danger
                icon={<DeleteFilled />}
                size="small"
              >
                Eliminar
              </Button>{" "}
            </Popconfirm>
          </Col>
          <Col span={12}>
            <Button
              size="small"
              type="primary"
              onClick={() => selectClient(x)}
              icon={<RightCircleFilled />}
            >
              Editar
            </Button>
          </Col>
        </Row>
      ),
    },
  ];

  useEffect(() => {
    getClients();
  }, [state.list.countUpdate, state.list.page]);

  return (
    <Table
      dataSource={state.list.results}
      size="small"
      title={() => (
        <Row justify={"space-between"}>
          <Col>
            <b>Residuos registrados: {state.list.count}</b>
          </Col>
          <Col>
            <Button
              style={{ backgroundColor: `#389e0d`, borderColor: `#389e0d` }}
              type={`primary`}
              size={`small`}
              icon={<FileExcelFilled />}
              onClick={downloadDataToExcel}
            >
              Descargar reporte(todos)
            </Button>
          </Col>
        </Row>
      )}
      bordered
      rowKey={(x) => x.id}
      pagination={{
        total: state.list.count,
        onChange: (page) => dispatch({ type: "change_page", page: page }),
      }}
      columns={columns}
    />
  );
};

export default List;
