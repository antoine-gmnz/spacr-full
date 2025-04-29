import { Button } from "src/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "src/components/ui/dialog";

import React from "react";

interface DialogContentProps {
    triggerLabel: string;
    content: React.ReactNode;
    footerContent: React.ReactNode;
}

export function DialogWrapper({
    triggerLabel,
    content,
    footerContent,
}: DialogContentProps): JSX.Element {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">{triggerLabel}</Button>
            </DialogTrigger>
            <DialogContent className="min-w-full">
                <DialogHeader>
                    <DialogTitle />
                </DialogHeader>
                <div>{content}</div>
                <DialogFooter>{footerContent}</DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
