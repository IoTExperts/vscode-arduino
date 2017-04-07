import * as React from "react";
import * as ReactInfinite from "react-infinite";

interface IWrapperProps extends React.Props<any> {
    children: any;
    updateHeight: (number) => void;
}

class ItemWrapper extends React.Component<IWrapperProps, {}> {
  private node: any;

  componentDidMount() {
    const height = this.node.getBoundingClientRect().height;
    this.props.updateHeight(height);
  }

  render() {
    return (
      <div ref={ (node) => this.node = node }>
        {this.props.children}
      </div>
    );
  }
}

interface IInfiniteProps extends React.Props<any> {
    list: any;
    useWindowAsScrollContainer?: boolean;
    scrollContainer?: any;
    heights?: Array<number>;
    preloadAdditionalHeight?: number;
    heightsUpdateCallback?: (any) => void;
}

interface IInfiniteState extends React.Props<any> {
    heights: Array<number>;
    elements: Array<any>;
}

export default class InfiniteListView extends React.Component<IInfiniteProps, IInfiniteState> {
  private lastScrollTop = 0;
  private scrollTopDelta = 0;
  public static defaultProps: Partial<IInfiniteProps> = {
    heights: [],
    heightsUpdateCallback: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      heights: [],
      elements: [],
    };
  }

  getScrollContainer() {
    if (this.props.useWindowAsScrollContainer) {
      return document.body;
    }
    return this.props.scrollContainer;
  }

  updateHeight(i, newHeight) {
    const heights = this.state.heights;
    var scrollDiff = newHeight - heights[i];
    if (scrollDiff && this.scrollTopDelta < 0) {
      this.getScrollContainer().scrollTop += scrollDiff;
    }
    heights[i] = newHeight;
    this.props.heightsUpdateCallback(heights);
    this.setState({
      heights,
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.list != this.props.list) {
      this.buildElements(nextProps.list);
    }
  }

  buildElements(propsList) {
    const heights = [];

    const elements = propsList.map((x, i) => {
      heights[i] = this.state.heights[i] || this.props.heights[i] || 200;

      return (<ItemWrapper
        updateHeight={this.updateHeight.bind(this, i)}
        key={i} children={x}>
      </ItemWrapper>);
    });

    this.setState({
      heights,
      elements,
    });
  }

  handleScroll() {
    const scrollTop = this.getScrollContainer().scrollTop;
    this.scrollTopDelta = scrollTop -this.lastScrollTop;
    this.lastScrollTop = scrollTop;
  }

  render() {
    /*preloadBatchSize={ ReactInfinite.containerHeightScaleFactor(2) }*/
    return (
      <ReactInfinite
        elementHeight={ this.state.heights }
        handleScroll={ this.handleScroll.bind(this) }
        preloadAdditionalHeight={ ReactInfinite.containerHeightScaleFactor(2) }
        { ...this.props }>
        { this.state.elements }
      </ReactInfinite>
    );
  }
}
