import { AppSwitch } from '@coreui/react';
import { GridDetailRow } from '@progress/kendo-react-grid';
import React from 'react';
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap';
import Server from '../../config';

class DetailComponent extends GridDetailRow {
  constructor(props) {
    super(props);
    console.log('[DetailComponent.constructor] props:', props);
  }
  render() {
    const data = this.props.dataItem;
    console.log('[DetailComponent.render] data:', data);
    if (data.ownerId === '') {
      // <div style={{ height: "50px", width: "100%" }}>
      //   <div style={{ position: "absolute", width: "100%" }}>
      //     <div className="k-loading-image" />
      //   </div>
      // </div>
      return (<p>There is no data available for this provider</p>);
    }
    let attachmentsRow;
    if (data.attachments !== null) {
      let src = Server.Addr;
      if (Server.Port !== '80') {
        src += ':' + Server.Port;
      }
      src += '/api/file/download/';
      console.log('[DetailComponent] image src:', src);
      attachmentsRow = (<Row> {data.attachments.map((attachment, index) => {
        return (<Col xs="12" sm="4" md="3" key={attachment.fileId}>
          <Card style={{ marginRight: '3px', marginLeft: '3px' }}>
            <CardHeader style={{ margin: '1px' }}>{attachment.description}
              <AppSwitch className={'float-right mb-0'} label color={'info'} defaultChecked size={'sm'} />
            </CardHeader>
            <CardBody style={{ margin: '1px', padding: '1px' }}>
              <img style={{ width: '100%', maxHeight: '293px', height: '100%' }} src={src + attachment.fileId} />
            </CardBody>
          </Card>
        </Col>);
      })}</Row>);
    }
    let ownerDetails;
    if (data.owner != null) {
      ownerDetails = (<div>
        <p>name: {data.owner.firstName + ' ' + data.owner.lastName}</p>
        <p>username: {data.owner.username}</p>
        <p>nationalId: {data.owner.nationalId}</p>
        <p>imageId: {data.owner.imageId}</p>
      </div>);
    }
    const link = Server.Addr + '/#/service-center/' + data.id;
    console.log('[DetailComponent] link:', link);
    return (<div className="animated fadeIn">
      <p><a href={link}>Link to {data.name} </a></p>
      {ownerDetails}
      {attachmentsRow}
    </div>);
  }
}
export default DetailComponent;
