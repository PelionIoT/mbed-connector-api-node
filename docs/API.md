<a name="mbedConnectorApi"></a>
## mbedConnectorApi
**Kind**: global class  
**Emits**: <code>[notification](#mbedConnectorApi+event_notification)</code>, <code>[registration](#mbedConnectorApi+event_registration)</code>, <code>[reg-update](#mbedConnectorApi+event_reg-update)</code>, <code>[de-registration](#mbedConnectorApi+event_de-registration)</code>, <code>[registration-expired](#mbedConnectorApi+event_registration-expired)</code>  

* [mbedConnectorApi](#mbedConnectorApi)
    * [new mbedConnectorApi(options)](#new_mbedConnectorApi_new)
    * [.getEndpoints([callback], [options])](#mbedConnectorApi+getEndpoints)
    * [.getResources(endpoint, [callback], [options])](#mbedConnectorApi+getResources)
    * [.getResourceValue(endpoint, resource, [callback], [options])](#mbedConnectorApi+getResourceValue)
    * [.putResourceValue(endpoint, resource, value, [callback], [options])](#mbedConnectorApi+putResourceValue)
    * [.postResource(endpoint, resource, value, [callback], [options])](#mbedConnectorApi+postResource)
    * [.deleteEndpoint(endpoint, [callback], [options])](#mbedConnectorApi+deleteEndpoint)
    * [.getLimits([callback], [options])](#mbedConnectorApi+getLimits)
    * [.getApiVersions([callback], [options])](#mbedConnectorApi+getApiVersions)
    * [.getConnectorVersion([callback], [options])](#mbedConnectorApi+getConnectorVersion)
    * [.getCallback([callback], [options])](#mbedConnectorApi+getCallback)
    * [.putCallback(data, [callback], [options])](#mbedConnectorApi+putCallback)
    * [.deleteCallback([callback], [options])](#mbedConnectorApi+deleteCallback)
    * [.startLongPolling([callback], [options])](#mbedConnectorApi+startLongPolling)
    * [.stopLongPolling()](#mbedConnectorApi+stopLongPolling)
    * [.getResourceSubscription(endpoint, resource, [callback], [options])](#mbedConnectorApi+getResourceSubscription)
    * [.putResourceSubscription(endpoint, resource, [callback], [options])](#mbedConnectorApi+putResourceSubscription)
    * [.deleteResourceSubscription(endpoint, resource, [callback], [options])](#mbedConnectorApi+deleteResourceSubscription)
    * [.getEndpointSubscriptions(endpoint, [callback], [options])](#mbedConnectorApi+getEndpointSubscriptions)
    * [.deleteEndpointSubscriptions(endpoint, [callback], [options])](#mbedConnectorApi+deleteEndpointSubscriptions)
    * [.deleteAllSubscriptions([callback])](#mbedConnectorApi+deleteAllSubscriptions)
    * [.getPreSubscription([callback], [options])](#mbedConnectorApi+getPreSubscription)
    * [.putPreSubscription(data, [callback], [options])](#mbedConnectorApi+putPreSubscription)
    * ["notification"](#mbedConnectorApi+event_notification)
    * ["registration"](#mbedConnectorApi+event_registration)
    * ["reg-update"](#mbedConnectorApi+event_reg-update)
    * ["de-registration"](#mbedConnectorApi+event_de-registration)
    * ["registration-expired"](#mbedConnectorApi+event_registration-expired)

<a name="new_mbedConnectorApi_new"></a>
### new mbedConnectorApi(options)
Represents an mbed Device Connector REST API Client


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  | Options object |
| options.accessKey | <code>string</code> |  | Access Key for your mbed Device Connector account |
| [options.host] | <code>string</code> | <code>&quot;https://api.connector.mbed.com&quot;</code> | URL for mbed Device Connector API |
| [options.restApiVersion] | <code>string</code> | <code>&quot;v2&quot;</code> | Version of mbed Device Connector REST API to use |

<a name="mbedConnectorApi+getEndpoints"></a>
### mbedConnectorApi.getEndpoints([callback], [options])
Gets a list of currently registered endpoints

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>function</code> | A function that is passed the arguments `(error, endpoints)` |
| [options] | <code>Object</code> | Optional options object |
| [options.parameters.type] | <code>string</code> | Filters endpoints by endpoint-type |

<a name="mbedConnectorApi+getResources"></a>
### mbedConnectorApi.getResources(endpoint, [callback], [options])
Gets a list of an endpoint's resources

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  

| Param | Type | Description |
| --- | --- | --- |
| endpoint | <code>string</code> | The name of the endpoint |
| [callback] | <code>function</code> | A function that is passed the arguments `(error, resources)` |
| [options] | <code>Object</code> | Optional options object |

<a name="mbedConnectorApi+getResourceValue"></a>
### mbedConnectorApi.getResourceValue(endpoint, resource, [callback], [options])
GETs the value of an endpoint's resource

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| endpoint | <code>string</code> |  | The name of the endpoint |
| resource | <code>string</code> |  | The path to the resource |
| [callback] | <code>function</code> |  | A function that is passed the arguments `(error, value)` where `value` is the value of the resource formatted as a string. |
| [options] | <code>Object</code> |  | Optional options object |
| [options.parameters.cacheOnly] | <code>boolean</code> | <code>false</code> | If `true`, the response will come only from the cache |
| [options.parameters.noResp] | <code>boolean</code> | <code>false</code> | If `true`, mbed Device Connector will not wait for a response. Creates a CoAP Non-Confirmable requests. If `false`, a response is expected and the CoAP request is confirmable. |

<a name="mbedConnectorApi+putResourceValue"></a>
### mbedConnectorApi.putResourceValue(endpoint, resource, value, [callback], [options])
PUTs a value of an endpoint's resource

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| endpoint | <code>string</code> |  | The name of the endpoint |
| resource | <code>string</code> |  | The path to the resource |
| value | <code>string</code> |  | The value of the resource |
| [callback] | <code>function</code> |  | A function that is passed a potential `error` object |
| [options] | <code>Object</code> |  | Optional options object |
| [options.parameters.cacheOnly] | <code>boolean</code> | <code>false</code> | If `true`, the response will come only from the cache |
| [options.parameters.noResp] | <code>boolean</code> | <code>false</code> | If `true`, mbed Device Connector will not wait for a response. Creates a CoAP Non-Confirmable requests. If `false`, a response is expected and the CoAP request is confirmable. |

<a name="mbedConnectorApi+postResource"></a>
### mbedConnectorApi.postResource(endpoint, resource, value, [callback], [options])
POSTs a value of an endpoint's resource

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| endpoint | <code>string</code> |  | The name of the endpoint |
| resource | <code>string</code> |  | The path to the resource |
| value | <code>string</code> |  | The value of the resource (can be `null`) |
| [callback] | <code>function</code> |  | A function that is passed a potential `error` object |
| [options] | <code>Object</code> |  | Optional options object |
| [options.parameters.cacheOnly] | <code>boolean</code> | <code>false</code> | If `true`, the response will come only from the cache |
| [options.parameters.noResp] | <code>boolean</code> | <code>false</code> | If `true`, mbed Device Connector will not wait for a response. Creates a CoAP Non-Confirmable requests. If `false`, a response is expected and the CoAP request is confirmable. |

<a name="mbedConnectorApi+deleteEndpoint"></a>
### mbedConnectorApi.deleteEndpoint(endpoint, [callback], [options])
DELETEs an endpoint

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| endpoint | <code>string</code> |  | The name of the endpoint |
| [callback] | <code>function</code> |  | A function that is passed a potential `error` object |
| [options] | <code>Object</code> |  | Optional options object |
| [options.parameters.cacheOnly] | <code>boolean</code> | <code>false</code> | If `true`, the response will come only from the cache |
| [options.parameters.noResp] | <code>boolean</code> | <code>false</code> | If `true`, mbed Device Connector will not wait for a response. Creates a CoAP Non-Confirmable requests. If `false`, a response is expected and the CoAP request is confirmable. |

<a name="mbedConnectorApi+getLimits"></a>
### mbedConnectorApi.getLimits([callback], [options])
Gets the current traffic usage and limits of the mbed Device Connector
account

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>function</code> | A function that is passed the arguments `(error, limits)` |
| [options] | <code>Object</code> | Optional options object |

<a name="mbedConnectorApi+getApiVersions"></a>
### mbedConnectorApi.getApiVersions([callback], [options])
Gets a list of the available REST API versions

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>function</code> | A function that is passed the arguments `(error, versions)` |
| [options] | <code>Object</code> | Optional options object |

<a name="mbedConnectorApi+getConnectorVersion"></a>
### mbedConnectorApi.getConnectorVersion([callback], [options])
Gets the current mbed Device Connector version

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>function</code> | A function that is passed the arguments `(error, version)` |
| [options] | <code>Object</code> | Optional options object |

<a name="mbedConnectorApi+getCallback"></a>
### mbedConnectorApi.getCallback([callback], [options])
GETs the current callback data

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>function</code> | A function that is passed the arguments `(error, callbackData)` where `callbackData` is an object containing a `url` string and a `headers` object |
| [options] | <code>Object</code> | Optional options object |

<a name="mbedConnectorApi+putCallback"></a>
### mbedConnectorApi.putCallback(data, [callback], [options])
PUTs callback data

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | The callback data |
| data.url | <code>string</code> | The callback URL |
| [data.headers] | <code>Object</code> | The headers that should be set when mbed Device Connector PUTs to the given callback URL |
| [callback] | <code>function</code> | A function that is passed a potential `error` object |
| [options] | <code>Object</code> | Optional options object |

<a name="mbedConnectorApi+deleteCallback"></a>
### mbedConnectorApi.deleteCallback([callback], [options])
DELETEs the callback data (effectively stopping mbed Device Connector from
PUTing notifications)

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>function</code> | A function that is passed a potential `error` object |
| [options] | <code>Object</code> | Optional options object |

<a name="mbedConnectorApi+startLongPolling"></a>
### mbedConnectorApi.startLongPolling([callback], [options])
Begins long polling constantly for notifications

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>function</code> | A function that is passed a potential `error` object |
| [options] | <code>Object</code> | Optional options object |

<a name="mbedConnectorApi+stopLongPolling"></a>
### mbedConnectorApi.stopLongPolling()
Stops long polling for notifications

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  
<a name="mbedConnectorApi+getResourceSubscription"></a>
### mbedConnectorApi.getResourceSubscription(endpoint, resource, [callback], [options])
GETs the status of a resource's subscription

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  

| Param | Type | Description |
| --- | --- | --- |
| endpoint | <code>string</code> | The name of the endpoint |
| resource | <code>string</code> | The path to the resource |
| [callback] | <code>function</code> | A function that is passed `(error, subscribed)` where `subscribed` is `true` or `false` |
| [options] | <code>Object</code> | Optional options object |

<a name="mbedConnectorApi+putResourceSubscription"></a>
### mbedConnectorApi.putResourceSubscription(endpoint, resource, [callback], [options])
PUTs a subscription to a resource

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  

| Param | Type | Description |
| --- | --- | --- |
| endpoint | <code>string</code> | The name of the endpoint |
| resource | <code>string</code> | The path to the resource |
| [callback] | <code>function</code> | A function that is passed a potential `error` object |
| [options] | <code>Object</code> | Optional options object |

<a name="mbedConnectorApi+deleteResourceSubscription"></a>
### mbedConnectorApi.deleteResourceSubscription(endpoint, resource, [callback], [options])
DELETEs a resource's subscription

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  

| Param | Type | Description |
| --- | --- | --- |
| endpoint | <code>string</code> | The name of the endpoint |
| resource | <code>string</code> | The path to the resource |
| [callback] | <code>function</code> | A function that is passed a potential `error` object |
| [options] | <code>Object</code> | Optional options object |

<a name="mbedConnectorApi+getEndpointSubscriptions"></a>
### mbedConnectorApi.getEndpointSubscriptions(endpoint, [callback], [options])
Gets a list of an endpoint's subscriptions

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  

| Param | Type | Description |
| --- | --- | --- |
| endpoint | <code>string</code> | The name of the endpoint |
| [callback] | <code>function</code> | A function that is passed `(error, subscriptions)` |
| [options] | <code>Object</code> | Optional options object |

<a name="mbedConnectorApi+deleteEndpointSubscriptions"></a>
### mbedConnectorApi.deleteEndpointSubscriptions(endpoint, [callback], [options])
Removes an endpoint's subscriptions

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  

| Param | Type | Description |
| --- | --- | --- |
| endpoint | <code>string</code> | The name of the endpoint |
| [callback] | <code>function</code> | A function that is passed a potential `error` object |
| [options] | <code>Object</code> | Optional options object |

<a name="mbedConnectorApi+deleteAllSubscriptions"></a>
### mbedConnectorApi.deleteAllSubscriptions([callback])
Removes all subscriptions

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>function</code> | A function that is passed a potential `error` object |

<a name="mbedConnectorApi+getPreSubscription"></a>
### mbedConnectorApi.getPreSubscription([callback], [options])
GETs pre-subscription data

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>function</code> | A function that is passed `(error, data)` |
| [options] | <code>Object</code> | Optional options object |

<a name="mbedConnectorApi+putPreSubscription"></a>
### mbedConnectorApi.putPreSubscription(data, [callback], [options])
PUTs pre-subscription data

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | The pre-subscription data |
| [callback] | <code>function</code> | A function that is passed a potential `error` object |
| [options] | <code>Object</code> | Optional options object |

<a name="mbedConnectorApi+event_notification"></a>
### "notification"
Resource notification event.

**Kind**: event emitted by <code>[mbedConnectorApi](#mbedConnectorApi)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| notification | <code>Object</code> | A notifcation object |

<a name="mbedConnectorApi+event_registration"></a>
### "registration"
Endpoint registration event.

**Kind**: event emitted by <code>[mbedConnectorApi](#mbedConnectorApi)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| registration | <code>Object</code> | A registration object |

<a name="mbedConnectorApi+event_reg-update"></a>
### "reg-update"
Endpoint registration update event.

**Kind**: event emitted by <code>[mbedConnectorApi](#mbedConnectorApi)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| regUpdate | <code>Object</code> | A registration update object |

<a name="mbedConnectorApi+event_de-registration"></a>
### "de-registration"
Endpoint de-registration event.

**Kind**: event emitted by <code>[mbedConnectorApi](#mbedConnectorApi)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| endpoint | <code>string</code> | The name of the endpoint |

<a name="mbedConnectorApi+event_registration-expired"></a>
### "registration-expired"
Endpoint registration expiration event.

**Kind**: event emitted by <code>[mbedConnectorApi](#mbedConnectorApi)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| endpoint | <code>string</code> | The name of the endpoint |

