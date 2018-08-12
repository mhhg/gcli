import React from "react";
import { GridCell } from "@progress/kendo-react-grid";

const cellWithLink = function(basePath) {
  return class extends GridCell {
    render() {
      let link = basePath + this.props.dataItem.id,
        value = "";
      const id = this.props.dataItem.id;
      if (id !== undefined) {
        value = "..." + this.props.dataItem.id;
      }
      console.log("[Repair.cellWithLink] link:", link, "id:", id);
      return (
        <td>
          <a target="_blank" rel="noopener noreferrer" href={link}>
            {value}
          </a>
        </td>
      );
    }
  };
};

export default cellWithLink;
