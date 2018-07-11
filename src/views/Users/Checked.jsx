import { GridCell } from "@progress/kendo-react-grid";
import React from "react";

class CheckBox extends GridCell {
    constructor(props) {
        super(props);
        console.log("[CheckBox] props:", props);
        this.handleChange = this.handleChange.bind(this);
    }
    handleChange(e) {
        this.props.onChange({
            dataItem: this.props.dataItem, field: this.props.field,
            syntheticEvent: e.syntheticEvent, value: !e.target.value
        });
    }
    render() {
        let checked = "";
        if (this.props.dataItem.confirmed === true) {
            checked = "checked";
        }
        // TODO: These styles should be changed in future,
        // border-color: black!important;
        // should be assigned.
        // .k-checkbox-label:after, .k-checkbox-label:before, .k-radio-label:after, .k-radio-label:before
        return (
            <td style={{ padding: "2px" }}>
                {/* <input type="checkbox" className="k-checkbox" {this.state.value} {this.state.status}/> */}
                <input id="masterCheck" className="k-checkbox" type="checkbox"
                    checked={checked} onChange={this.handleChange} />
                <label htmlFor="masterCheck" className="k-checkbox-label"></label>
            </td>
        );
    }
}

export default CheckBox;
