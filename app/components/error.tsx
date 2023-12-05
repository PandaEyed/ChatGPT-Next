import { useEffect, useRef, useMemo } from "react";
import { useState } from "react";
import React from "react";
import { IconButton } from "./button";
import Image from "next/image";
import styles from "./home.module.scss";
import GithubIcon from "../icons/github.svg";
import CloseIcon from "../icons/close.svg";
import ResetIcon from "../icons/reload.svg";
import { ISSUE_URL } from "../constant";
import Locale from "../locales";
import { showConfirm } from "./ui-lib";
import { useSyncStore } from "../store/sync";
import { useChatStore } from "../store";
import WechatPng from "../icons/wechat.png";
import WeChatIcon from "../icons/wechat.svg";

interface IErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  info: React.ErrorInfo | null;
  isPopupOpen: boolean;
}

interface PopupProps {
  onClose: () => void;
}

const Popup: React.FC<PopupProps> = ({ onClose }) => {
  return (
    <div className={styles["popup-container"]}>
      <div className={styles["popup-content"]}>
        <h1>联系小明</h1>
        <p>如果使用中遇到任何问题，请联系我。</p>
        <Image src={WechatPng} alt="Xiao-Ming's WeChat" />
        <IconButton icon={<CloseIcon />} onClick={onClose} />
      </div>
    </div>
  );
};

export class ErrorBoundary extends React.Component<any, IErrorBoundaryState> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, info: null, isPopupOpen: false };
    this.openPopup = this.openPopup.bind(this);
    this.closePopup = this.closePopup.bind(this);
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ hasError: true, error, info });
  }

  clearAndSaveData() {
    try {
      useSyncStore.getState().export();
    } finally {
      localStorage.clear();
      location.reload();
    }
  }

  openPopup() {
    this.setState({ isPopupOpen: true });
  }

  closePopup() {
    this.setState({ isPopupOpen: false });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error">
          <h2>Oops, something went wrong!</h2>
          <pre>
            <code>{this.state.error?.toString()}</code>
            <code>{this.state.info?.componentStack}</code>
          </pre>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
              <IconButton
                text="Report This Error"
                icon={<WeChatIcon />} onClick={this.openPopup} bordered
              />
              {this.state.isPopupOpen && <Popup onClose={this.closePopup} />}
            <IconButton
              icon={<ResetIcon />}
              text="Clear All Data"
              onClick={async () => {
                if (await showConfirm(Locale.Settings.Danger.Reset.Confirm)) {
                  this.clearAndSaveData();
                }
              }}
              bordered
            />
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
