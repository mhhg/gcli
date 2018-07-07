import { GridDetailRow } from "@progress/kendo-react-grid";
import React from "react";
import Server from "../../config";

class DetailComponent extends GridDetailRow {
    constructor(props) {
        super(props);
        console.log("[DetailComponent.constructor] props:", props);
    }
    render() {
        const data = this.props.dataItem;
        console.log("[DetailComponent.render] data:", data);
        if (data.ownerId === "") {
            return <p>There is no data available for this provider</p>;
        }
        let ownerDetails;
        if (data.owner != null) {
            ownerDetails = (
                <div>
                    <p>
                        name: {data.owner.firstName + " " + data.owner.lastName}
                    </p>
                    <p>username: {data.owner.username}</p>
                    <p>nationalId: {data.owner.nationalId}</p>
                    <p>imageId: {data.owner.imageId}</p>
                </div>
            );
        }
        const link = Server.Addr + "/#/service-center/" + data.providerId;
        console.log("[DetailComponent] link:", link);
        return (
            <div className="animated fadeIn">
                <p>
                    <a href={link}>Link to the provider</a>
                </p>
                {ownerDetails}
            </div>
        );
    }
}

export default DetailComponent;
