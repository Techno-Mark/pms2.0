import React, { useState } from "react";
import {
  Modal,
  ModalAction,
  ModalContent,
  ModalTitle,
  Close,
  Button,
  Tooltip,
} from "next-ts-lib";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actionText: string;
  onActionClick: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  actionText,
  onActionClick,
}) => {
  const [disabled, setDisabled] = useState(false);
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalTitle>
        <div className="py-[20px] px-[19px] flex items-center justify-between w-full">
          <h2 className="font-medium text-lg">{title}</h2>
          <Tooltip className="!p-0" position={"top"} content="Close">
            <span onClick={onClose}>
              <Close />
            </span>
          </Tooltip>
        </div>
      </ModalTitle>
      <ModalContent>
        <div className="py-[15px] px-[20px]">{children}</div>
      </ModalContent>
      <ModalAction>
        <div className="flex items-center justify-end gap-[20px] px-[20px] py-[15px]">
          <Button
            variant="btn-outline"
            onClick={onClose}
            className="rounded-[4px] !h-[36px]"
          >
            No
          </Button>
          <Button
            variant="btn-error"
            disabled={disabled}
            onClick={() => {
              onActionClick();
              setDisabled(true);
            }}
            className="rounded-[4px] !h-[36px]"
          >
            {actionText}
          </Button>
        </div>
      </ModalAction>
    </Modal>
  );
};

export default DeleteModal;
