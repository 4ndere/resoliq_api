import React, { createContext, useReducer } from "react";
import { Col, Row, Tag } from "antd";
import { ordersReducer } from "../reducers/ordersReducer";
import List from "../components/orders/List";
import CreateUpdate from "../components/orders/CreateUpdate";

export const OrdersContext = createContext();

const Orders = () => {
  const initialState = {
    list: {
      results: [],
      count: 0,
      page: 1,
      countUpdate: 0,
    },
    select_to_edit: null,
  };

  const [state, dispatch] = useReducer(ordersReducer, initialState);

  return (
    <OrdersContext.Provider value={{ state, dispatch }}>
      <Row style={{ marginBottom: "10px" }}>
        <Col span={24} style={{ textAlign: "left" }}>
          <Tag>
            <b>/ DIAGNOSTICOS</b>
          </Tag>
        </Col>
      </Row>
      <Row align={`top`} justify={`space-around`}>
        <Col span={16} style={{ padding: `10px` }}>
          <List />
        </Col>
        <Col span={8} style={{ padding: `10px` }}>
          <CreateUpdate />
        </Col>
      </Row>
    </OrdersContext.Provider>
  );
};

export default Orders;
