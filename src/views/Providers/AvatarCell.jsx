import { GridCell } from '@progress/kendo-react-grid';
import React from 'react';
import Server from '../../config';


class AvatarCell extends GridCell {
    constructor(props) {
        super(props);

        let imageSrc = Server.Addr + '/api/file/avatar/';

        if (props.dataItem.imageId !== '') {
            imageSrc = imageSrc + props.dataItem.imageId;
        } else {
            imageSrc = 'assets/img/avatars/7.png';
        }

        console.log(
            '[AvatarCell] imageSrc:',
            imageSrc,
            'props.imageId:',
            props.dataItem.imageId,
            'ServerAddr:',
            Server.Addr
        );

        this.state = {
            imageSrc: imageSrc
        };
    }

    handleChange(e) {
        this.props.onChange({
            dataItem: this.props.dataItem,
            field: this.props.field,
            syntheticEvent: e.syntheticEvent,
            value: e.target.value
        });
    }

    render() {
        return (
            <td
                style={{
                    padding: '2px'
                }}
            >
                <img
                    style={{
                        height: '71px',
                        width: '71px'
                    }}
                    src={this.state.imageSrc}
                />
            </td>
        );
    }
}

export default AvatarCell;
