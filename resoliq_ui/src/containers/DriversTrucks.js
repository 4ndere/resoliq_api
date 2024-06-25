import React, { createContext, useReducer } from "react";
import { Col, Row, Tag } from "antd";
import { driversReducer } from "../reducers/driversReducer";
import List from "../components/drivers/List";
import CreateUpdate from "../components/drivers/CreateUpdate";
export const DriversContext = createContext();

const DriversTruck = () => {
  const initialState = {
    list: {
      results: [],
      count: 0,
      page: 1,
      countUpdate: 0,
    },
    select_to_edit: null,
  };

  const [state, dispatch] = useReducer(driversReducer, initialState);

  return (
    <DriversContext.Provider value={{ state, dispatch }}>
      <Row style={{ marginBottom: "10px" }}>
        <Col span={24} style={{ textAlign: "left" }}>
          <Tag>
            <b>/ CLIENTES</b>
          </Tag>
        </Col>
      </Row>
      <Row align={`middle`} justify={`space-around`}>
        <Col span={14}>
          <List />
        </Col>
        <Col span={8}>
          <CreateUpdate />
        </Col>
      </Row>
    </DriversContext.Provider>
  );
};

export default DriversTruck;
