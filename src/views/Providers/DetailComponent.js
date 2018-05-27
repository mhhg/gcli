import React from "react";
import {
  Grid,
  GridColumn as Column,
  GridDetailRow
} from "@progress/kendo-react-grid";
import {
  Badge,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Col,
  Row,
  Collapse,
  Fade
} from "reactstrap";
import { AppSwitch } from "@coreui/react";
import Server from "../../config";

class DetailComponent extends GridDetailRow {
  constructor(props) {
    super(props);
    console.log("[DetailComponent.constructor] props:", props);
  }

  render() {
    const data = this.props.dataItem.attachments;
    console.log("[DetailComponent.render] attachments:", data);

    if (data) {
      return (
        <div className="animated fadeIn" >
          <Row>
            {data.map((attachment, index) => {
              return (
                <Col xs="12" sm="4" md="3" key={attachment.fileId}>
                  <Card style={{ marginRight: "3px", marginLeft: "3px" }}>
                    <CardHeader
                      style={{
                        margin: "1px",
                        // padding: "1px"
                      }}
                    >
                      {attachment.description}
                      <AppSwitch
                        className={"float-right mb-0"}
                        label
                        color={"info"}
                        defaultChecked
                        size={"sm"}
                      />
                    </CardHeader>
                    <CardBody
                      style={{
                        margin: "1px",
                        padding: "1px"
                      }}
                    >
                      <img
                        style={{
                          width: "100%",
                          maxHeight: "293px",
                          height: "100%"
                          // display: "block",
                          // position: "absolute",
                          // top: "50%",
                          // left: "50%",
                          // minHeight: "100%",
                          // minWidth: "100%",
                          // transform: "translate(-50%, -50%)"
                        }}
                        src={
                          Server.Addr +
                          ":8000/api/file/download/" +
                          attachment.fileId
                        }
                      />
                    </CardBody>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>
        // <Grid data={data}>
        //   <Column field="ProductID" title="Product ID" width="120px" />
        //   <Column field="ProductName" title="Product Name" />
        //   <Column field="UnitPrice" title="Unit Price" format="{0:c}" />
        // </Grid>
      );
    }
    return (
      <p>There is no attachments available for this provider</p>
      // <div style={{ height: "50px", width: "100%" }}>
      //   <div style={{ position: "absolute", width: "100%" }}>
      //     <div className="k-loading-image" />
      //   </div>
      // </div>
    );
  }
}

export default DetailComponent;
