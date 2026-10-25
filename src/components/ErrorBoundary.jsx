import { Component } from 'react';

// If any screen crashes, show a calm message instead of a blank page. Saved data is never touched.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    console.error('[Licence Saathi] screen error:', error);
  }
  render() {
    if (!this.state.failed) return this.props.children;
    const hi = document.documentElement.lang === 'hi';
    return (
      <div className="h-full grid place-items-center px-6 text-center">
        <div className="max-w-sm">
          <p className="font-display text-[2rem] leading-tight">{hi ? 'कुछ ठीक से नहीं खुला' : 'This screen did not open properly'}</p>
          <p className="mt-2 text-muted">{hi ? 'यह आपकी गलती नहीं है। आपकी सारी जानकारी सुरक्षित है।' : 'This is not your fault. All your details are safe.'}</p>
          <div className="grid gap-2 mt-5">
            <button className="btn-primary" onClick={() => { this.setState({ failed: false }); window.location.hash = '#/'; }}>
              {hi ? 'होम पर जाएँ' : 'Go to home'}
            </button>
            <button className="btn-secondary" onClick={() => window.location.reload()}>{hi ? 'फिर से खोलें' : 'Reload'}</button>
          </div>
        </div>
      </div>
    );
  }
}
