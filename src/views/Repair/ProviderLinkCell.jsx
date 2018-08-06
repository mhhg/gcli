import React from 'react';
import { GridCell } from "@progress/kendo-react-grid";


const cellWithLink = function(basePath) {
    return class extends GridCell {
        render() {
            let link = basePath + this.props.dataItem.providerId,
                value = "";
            const id = this.props.dataItem.providerId;
            if (id !== undefined) {
                value = "..." + this.props.dataItem.providerId;
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