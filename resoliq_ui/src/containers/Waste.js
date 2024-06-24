import React, { useEffect, createContext, useReducer } from "react";
import { Col, Form, Row, Button, Table, Tag } from "antd";
import CreateUpdate from "../components/residues/CreateUpdate";
import List from "../components/residues/List";
import { wasteReducer } from "../reducers/wasteReducer";

export const WasteContext = createContext();

const Waste = () => {
  const initialState = {
    list: {
      results: [],
      count: 0,
      page: 1,
      countUpdate: 0,
    },
    select_to_edit: null,
    add_quantity: false,
    sus_quantity: false,
  };

  const [state, dispatch] = useReducer(wasteReducer, initialState);

  return (
    <WasteContext.Provider value={{ state, dispatch }}>
      <Row align={"middle"} justify={"space-around"}>
        <Col span={24} style={{ textAlign: "left", marginBottom: "10px" }}>
          <Tag>
            <b>/ CLIENTES</b>
          </Tag>
        </Col>

        <Col span={8}>
          <CreateUpdate />
        </Col>
        <Col span={13}>
          <List />
        </Col>
      </Row>
    </WasteContext.Provider>
  );
};

export default Waste;
