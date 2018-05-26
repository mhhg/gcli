import React from "react";

import { GridCell } from "@progress/kendo-react-grid";
import { DropDownList } from "@progress/kendo-react-dropdowns";

class DropDownCell extends GridCell {
  handleChange(e) {
    this.props.onChange({
      dataItem: this.props.dataItem,
      field: this.props.field,
      syntheticEvent: e.syntheticEvent,
      value: e.target.value
    });
  }

  render() {
    const value = this.props.dataItem[this.props.field];

    if (!this.props.dataItem.inEdit) {
      return (
        <td>
          {value === null
            ? ""
            : this.props.dataItem[this.props.field].toString()}
        </td>
      );
    }

    return (
      <td>
        <DropDownList
          style={{ width: "100px" }}
          onChange={this.handleChange.bind(this)}
          value={value}
          data={[
            { text: "yes", value: true },
            { text: "no", value: false },
            { text: "(empty)", value: null }
          ]}
          valueField="value"
          textField="text"
        />
      </td>
    );
  }
}

export default DropDownCell;
