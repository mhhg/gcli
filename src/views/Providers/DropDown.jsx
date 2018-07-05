class DropDownListContainer extends React.Component {
    constructor(props) {
        super(props);
        this.dataSource = new kendo.data.DataSource({
            data: props.data
        });
        this.placeholder = 'category';
    }

    render() {
        return (
            <div className="row">
                <div className="col-xs-12 col-sm-6 example-col">
                    <DropDownList
                        dataSource={this.dataSource}
                        placeholder={this.placeholder}
                    />
                </div>
            </div>
        );
    }
}
