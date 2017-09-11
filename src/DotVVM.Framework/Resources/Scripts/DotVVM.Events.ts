﻿class DotvvmEvents {
    public init = new DotvvmEvent<DotvvmEventArgs>("dotvvm.events.init", true);
    public beforePostback = new DotvvmEvent<DotvvmBeforePostBackEventArgs>("dotvvm.events.beforePostback");
    public afterPostback = new DotvvmEvent<DotvvmAfterPostBackEventArgs>("dotvvm.events.afterPostback");
    public error =  new DotvvmEvent<DotvvmErrorEventArgs>("dotvvm.events.error");
    public spaNavigating = new DotvvmEvent<DotvvmSpaNavigatingEventArgs>("dotvvm.events.spaNavigating");
    public spaNavigated = new DotvvmEvent<DotvvmSpaNavigatedEventArgs>("dotvvm.events.spaNavigated");
    public redirect = new DotvvmEvent<DotvvmRedirectEventArgs>("dotvvm.events.redirect");
}

// DotvvmEvent is used because CustomEvent is not browser compatible and does not support 
// calling missed events for handler that subscribed too late.
class DotvvmEvent<T extends DotvvmEventArgs> {
    private handlers : ((f:T) => void)[] = [];
    private history : T[] = [];

    constructor(public name: string, private triggerMissedEventsOnSubscribe: boolean = false) {
    }

    public subscribe(handler: (data: T) => void) {
        this.handlers.push(handler);

        if (this.triggerMissedEventsOnSubscribe) {
            for (var i = 0; i < this.history.length; i++) {
                handler(history[i]);
            }
        }
    }

    public unsubscribe(handler: (data: T) => void) {
        var index = this.handlers.indexOf(handler);
        if (index >= 0) {
            this.handlers = this.handlers.splice(index, 1);
        }
    }

    public trigger(data: T): void {
        for (var i = 0; i < this.handlers.length; i++) {
            this.handlers[i](data);
        }

        if (this.triggerMissedEventsOnSubscribe) {
            this.history.push(data);
        }
    }
}

interface PostbackEventArgs extends DotvvmEventArgs {
    postbackClientId: number
    viewModelName: string
    sender?: Element
    xhr?: XMLHttpRequest
    serverResponseObject?: any
}

interface DotvvmEventArgs {
    viewModel: any
}
class DotvvmErrorEventArgs implements PostbackEventArgs {
    public handled = false;
    constructor(public sender: Element | undefined, public viewModel: any, public viewModelName: any, public xhr: XMLHttpRequest, public postbackClientId, public serverResponseObject: any = undefined, public isSpaNavigationError: boolean = false) {
    }
}
class DotvvmBeforePostBackEventArgs implements PostbackEventArgs {
    public cancel: boolean = false;
    public clientValidationFailed: boolean = false;
    constructor(public sender: HTMLElement, public viewModel: any, public viewModelName: string, public validationTargetPath: any, public postbackClientId: number) {
    }
}
class DotvvmAfterPostBackEventArgs implements PostbackEventArgs {
    public isHandled: boolean = false;
    public wasInterrupted: boolean = false;
    constructor(public sender: HTMLElement | undefined, public viewModel: any, public viewModelName: string, public validationTargetPath: any, public serverResponseObject: any, public postbackClientId: number, public commandResult: any = null) {
    }
}
class DotvvmSpaNavigatingEventArgs implements DotvvmEventArgs {
    public cancel: boolean = false;
    constructor(public viewModel: any, public viewModelName: string, public newUrl: string) {
    }
}
class DotvvmSpaNavigatedEventArgs implements DotvvmEventArgs {
    public isHandled: boolean = false;
    constructor(public viewModel: any, public viewModelName: string, public serverResponseObject: any) {
    }
}
class DotvvmRedirectEventArgs implements DotvvmEventArgs {
    public isHandled: boolean = false;
    constructor(public viewModel: any, public viewModelName: string, public url: string, public replace: boolean) {
    }
}
