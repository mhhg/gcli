import React from "react";
import {
  Grid,
  GridColumn as Column,
  GridDetailRow
} from "@progress/kendo-react-grid";
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
      let images = "";

      for (var index = 0; index < data.length; index++) {
        images += "<img src='"+Server.Addr+"/"+data[index].fileId+"'/>"
      }
      return (
        { images }
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
