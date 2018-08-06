import React from 'react';
import { GridCell } from "@progress/kendo-react-grid";

const cellWithSMS = function(smsSender) {
    return class extends GridCell {
        render() {
            return (
                <td>
                    <button
                        className="k-button"
                        onClick={() => {
                            smsSender(this.props.dataItem, "customer");
                        }}
                    >
                        C
                    </button>
                    <button
                        className="k-button"
                        onClick={() => {
                            smsSender(this.props.dataItem, "provider");
                        }}
                    >
                        P
                    </button>
                    <button
                        className="k-button"
                        onClick={() => {
                            smsSender(this.props.dataItem, "*");
                        }}
                    >
                        *
                    </button>
                </td>
            );
        }
    };
};

export default cellWithSMS;