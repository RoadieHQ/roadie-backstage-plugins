import { Component } from 'react';
import Alert from '@material-ui/lab/Alert';

interface Props {
  children: JSX.Element;
}
interface MyProps {
  children: JSX.Element;
}

interface MyState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<MyProps, MyState> {
  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <Alert severity="error">
          Something went wrong. Please make sure that you installed:
          <strong>
            <a
              href="https://github.com/RoadieHQ/backstage-plugin-aws-auth"
              target="_blank"
              rel="noopener noreferrer"
            >
              @roadiehq/backstage-plugin-aws-auth plugin
            </a>
          </strong>
        </Alert>
      );
    }

    return this.props.children;
  }
}
