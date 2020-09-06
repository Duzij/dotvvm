﻿import * as postback from '../postback/postback';
import * as uri from '../utils/uri';
import * as http from '../postback/http';
import { getViewModel } from '../dotvvm-base';
import { loadResourceList } from '../postback/resourceLoader';
import * as updater from '../postback/updater';
import * as counter from '../postback/counter';
import * as events from './events';
import { getSpaPlaceHolderUniqueId, isSpaReady } from './spa';
import { handleRedirect } from '../postback/redirect';
import * as gate from '../postback/gate';

let lastStartedNavigation = -1

export async function navigateCore(url: string, handlePageNavigating?: (url: string) => void): Promise<DotvvmNavigationEventArgs> {
    const currentPostBackCounter = counter.backUpPostBackCounter();
    
    const options: PostbackOptions = {
        commandType: "spaNavigation",
        postbackId: currentPostBackCounter,
        args: []
    };
    let response: http.WrappedResponse<any> | undefined;

    try {
        // trigger spaNavigating event
        const spaNavigatingArgs: DotvvmSpaNavigatingEventArgs = {
            ...options,
            viewModel: getViewModel(),
            url,
            cancel: false
        };
        events.spaNavigating.trigger(spaNavigatingArgs);
        if (spaNavigatingArgs.cancel) {
            throw new DotvvmPostbackError({ type: "event" });
        }

        lastStartedNavigation = currentPostBackCounter
        gate.disablePostbacks()

        // compose URLs
        // TODO: get rid of ___dotvvm-spa___
        const spaFullUrl = uri.addVirtualDirectoryToUrl("/___dotvvm-spa___" + uri.addLeadingSlash(url));
        const displayUrl = uri.addVirtualDirectoryToUrl(url);

        // send the request
        response = await http.getJSON<any>(spaFullUrl, getSpaPlaceHolderUniqueId());

        // if another postback has already been passed, don't do anything
        if (currentPostBackCounter < lastStartedNavigation) {
            return <DotvvmNavigationEventArgs> { }; // TODO: what here https://github.com/riganti/dotvvm/pull/787/files#diff-edefee5e25549b2a6ed0136e520e009fR852
        }

        // use custom browser navigation function
        if (handlePageNavigating) {
            handlePageNavigating(displayUrl);
        }

        await loadResourceList(response.result.resources);

        if (response.result.action === "successfulCommand") {
            updater.updateViewModelAndControls(response.result, true);
            isSpaReady(true);
        } else if (response.result.action === "redirect") {
            const x = await handleRedirect(response.result, true) as DotvvmNavigationEventArgs
            return x
        }

        // trigger spaNavigated event
        const spaNavigatedArgs: DotvvmSpaNavigatedEventArgs = {
            ...options,
            url,
            viewModel: getViewModel(),
            serverResponseObject: response.result,
            response: response.response
        };
        events.spaNavigated.trigger(spaNavigatedArgs);

        return spaNavigatedArgs;

    } catch (err) {
        // trigger spaNavigationFailed event
        let spaNavigationFailedArgs: DotvvmSpaNavigatedEventArgs = { ...options, url, viewModel: getViewModel() };
        if (response) {
            spaNavigationFailedArgs = { ...spaNavigationFailedArgs, serverResponseObject: response.result, response: response.response };
        }
        events.spaNavigationFailed.trigger(spaNavigationFailedArgs);

        throw err;
    } finally {
        // when no other navigation is running, enable postbacks again
        if (currentPostBackCounter == lastStartedNavigation) {
            gate.enablePostbacks()
        }
    }
}
