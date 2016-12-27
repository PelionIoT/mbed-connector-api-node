<a name="mbedConnectorApi"></a>

## mbedConnectorApi
**Kind**: global class  
**Emits**: <code>[notification](#mbedConnectorApi+event_notification)</code>, <code>[registration](#mbedConnectorApi+event_registration)</code>, <code>[reg-update](#mbedConnectorApi+event_reg-update)</code>, <code>[de-registration](#mbedConnectorApi+event_de-registration)</code>, <code>[registration-expired](#mbedConnectorApi+event_registration-expired)</code>  

* [mbedConnectorApi](#mbedConnectorApi)
    * [new mbedConnectorApi(options)](#new_mbedConnectorApi_new)
    * [.getEndpoints([options], [callback])](#mbedConnectorApi+getEndpoints)
    * [.getResources(endpoint, [options], [callback])](#mbedConnectorApi+getResources)
    * [.getResourceValue(endpoint, resource, [options], [callback])](#mbedConnectorApi+getResourceValue)
    * [.putResourceValue(endpoint, resource, value, [options], [callback])](#mbedConnectorApi+putResourceValue)
    * [.postResource(endpoint, resource, value, [options], [callback])](#mbedConnectorApi+postResource)
    * [.deleteEndpoint(endpoint, [options], [callback])](#mbedConnectorApi+deleteEndpoint)
    * [.getLimits([options], [callback])](#mbedConnectorApi+getLimits)
    * [.getApiVersions([options], [callback])](#mbedConnectorApi+getApiVersions)
    * [.getCallback([options], [callback])](#mbedConnectorApi+getCallback)
    * [.putCallback(data, [options], [callback])](#mbedConnectorApi+putCallback)
    * [.deleteCallback([options], [callback])](#mbedConnectorApi+deleteCallback)
    * [.startLongPolling([options], [callback])](#mbedConnectorApi+startLongPolling)
    * [.stopLongPolling()](#mbedConnectorApi+stopLongPolling)
    * [.handleNotifications(payload)](#mbedConnectorApi+handleNotifications)
    * [.getResourceSubscription(endpoint, resource, [options], [callback])](#mbedConnectorApi+getResourceSubscription)
    * [.putResourceSubscription(endpoint, resource, [callback], [options])](#mbedConnectorApi+putResourceSubscription)
    * [.deleteResourceSubscription(endpoint, resource, [options], [callback])](#mbedConnectorApi+deleteResourceSubscription)
    * [.getEndpointSubscriptions(endpoint, [options], [callback])](#mbedConnectorApi+getEndpointSubscriptions)
    * [.deleteEndpointSubscriptions(endpoint, [options], [callback])](#mbedConnectorApi+deleteEndpointSubscriptions)
    * [.deleteAllSubscriptions([callback])](#mbedConnectorApi+deleteAllSubscriptions)
    * [.getPreSubscription([options], [callback])](#mbedConnectorApi+getPreSubscription)
    * [.putPreSubscription(data, [options], [callback])](#mbedConnectorApi+putPreSubscription)
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

### mbedConnectorApi.getEndpoints([options], [callback])
Gets a list of currently registered endpoints

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>Object</code> | Optional options object |
| [options.parameters.type] | <code>string</code> | Filters endpoints by endpoint-type |
| [callback] | <code>function</code> | A function that is passed the arguments `(error, endpoints)` |

<a name="mbedConnectorApi+getResources"></a>

### mbedConnectorApi.getResources(endpoint, [options], [callback])
Gets a list of an endpoint's resources

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  

| Param | Type | Description |
| --- | --- | --- |
| endpoint | <code>string</code> | The name of the endpoint |
| [options] | <code>Object</code> | Optional options object |
| [callback] | <code>function</code> | A function that is passed the arguments `(error, resources)` |

<a name="mbedConnectorApi+getResourceValue"></a>

### mbedConnectorApi.getResourceValue(endpoint, resource, [options], [callback])
GETs the value of an endpoint's resource

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| endpoint | <code>string</code> |  | The name of the endpoint |
| resource | <code>string</code> |  | The path to the resource |
| [options] | <code>Object</code> |  | Optional options object |
| [options.parameters.cacheOnly] | <code>boolean</code> | <code>false</code> | If `true`, the response will come only from the cache |
| [options.parameters.noResp] | <code>boolean</code> | <code>false</code> | If `true`, mbed Device Connector will not wait for a response. Creates a CoAP Non-Confirmable requests. If `false`, a response is expected and the CoAP request is confirmable. |
| [callback] | <code>function</code> |  | A function that is passed the arguments `(error, value)` where `value` is the value of the resource formatted as a string. |

<a name="mbedConnectorApi+putResourceValue"></a>

### mbedConnectorApi.putResourceValue(endpoint, resource, value, [options], [callback])
PUTs a value of an endpoint's resource

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| endpoint | <code>string</code> |  | The name of the endpoint |
| resource | <code>string</code> |  | The path to the resource |
| value | <code>string</code> |  | The value of the resource |
| [options] | <code>Object</code> |  | Optional options object |
| [options.parameters.cacheOnly] | <code>boolean</code> | <code>false</code> | If `true`, the response will come only from the cache |
| [options.parameters.noResp] | <code>boolean</code> | <code>false</code> | If `true`, mbed Device Connector will not wait for a response. Creates a CoAP Non-Confirmable requests. If `false`, a response is expected and the CoAP request is confirmable. |
| [callback] | <code>function</code> |  | A function that is passed a potential `error` object |

<a name="mbedConnectorApi+postResource"></a>

### mbedConnectorApi.postResource(endpoint, resource, value, [options], [callback])
POSTs a value of an endpoint's resource

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| endpoint | <code>string</code> |  | The name of the endpoint |
| resource | <code>string</code> |  | The path to the resource |
| value | <code>string</code> |  | The value of the resource (can be `null`) |
| [options] | <code>Object</code> |  | Optional options object |
| [options.parameters.cacheOnly] | <code>boolean</code> | <code>false</code> | If `true`, the response will come only from the cache |
| [options.parameters.noResp] | <code>boolean</code> | <code>false</code> | If `true`, mbed Device Connector will not wait for a response. Creates a CoAP Non-Confirmable requests. If `false`, a response is expected and the CoAP request is confirmable. |
| [callback] | <code>function</code> |  | A function that is passed a potential `error` object |

<a name="mbedConnectorApi+deleteEndpoint"></a>

### mbedConnectorApi.deleteEndpoint(endpoint, [options], [callback])
DELETEs an endpoint

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| endpoint | <code>string</code> |  | The name of the endpoint |
| [options] | <code>Object</code> |  | Optional options object |
| [options.parameters.cacheOnly] | <code>boolean</code> | <code>false</code> | If `true`, the response will come only from the cache |
| [options.parameters.noResp] | <code>boolean</code> | <code>false</code> | If `true`, mbed Device Connector will not wait for a response. Creates a CoAP Non-Confirmable requests. If `false`, a response is expected and the CoAP request is confirmable. |
| [callback] | <code>function</code> |  | A function that is passed a potential `error` object |

<a name="mbedConnectorApi+getLimits"></a>

### mbedConnectorApi.getLimits([options], [callback])
Gets the current traffic usage and limits of the mbed Device Connector
account

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>Object</code> | Optional options object |
| [callback] | <code>function</code> | A function that is passed the arguments `(error, limits)` |

<a name="mbedConnectorApi+getApiVersions"></a>

### mbedConnectorApi.getApiVersions([options], [callback])
Gets a list of the available REST API versions

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>Object</code> | Optional options object |
| [callback] | <code>function</code> | A function that is passed the arguments `(error, versions)` |

<a name="mbedConnectorApi+getCallback"></a>

### mbedConnectorApi.getCallback([options], [callback])
GETs the current callback data

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>Object</code> | Optional options object |
| [callback] | <code>function</code> | A function that is passed the arguments `(error, callbackData)` where `callbackData` is an object containing a `url` string and a `headers` object |

<a name="mbedConnectorApi+putCallback"></a>

### mbedConnectorApi.putCallback(data, [options], [callback])
PUTs callback data

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | The callback data |
| data.url | <code>string</code> | The callback URL |
| [data.headers] | <code>Object</code> | The headers that should be set when mbed Device Connector PUTs to the given callback URL |
| [options] | <code>Object</code> | Optional options object |
| [callback] | <code>function</code> | A function that is passed a potential `error` object |

<a name="mbedConnectorApi+deleteCallback"></a>

### mbedConnectorApi.deleteCallback([options], [callback])
DELETEs the callback data (effectively stopping mbed Device Connector from
PUTing notifications)

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>Object</code> | Optional options object |
| [callback] | <code>function</code> | A function that is passed a potential `error` object |

<a name="mbedConnectorApi+startLongPolling"></a>

### mbedConnectorApi.startLongPolling([options], [callback])
Begins long polling constantly for notifications

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>Object</code> | Optional options object |
| [callback] | <code>function</code> | A function that is passed a potential `error` object |

<a name="mbedConnectorApi+stopLongPolling"></a>

### mbedConnectorApi.stopLongPolling()
Stops long polling for notifications

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  
<a name="mbedConnectorApi+handleNotifications"></a>

### mbedConnectorApi.handleNotifications(payload)
Parse a JSON payload from a notification

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>Object</code> | The payload object from a notification |

<a name="mbedConnectorApi+getResourceSubscription"></a>

### mbedConnectorApi.getResourceSubscription(endpoint, resource, [options], [callback])
GETs the status of a resource's subscription

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  

| Param | Type | Description |
| --- | --- | --- |
| endpoint | <code>string</code> | The name of the endpoint |
| resource | <code>string</code> | The path to the resource |
| [options] | <code>Object</code> | Optional options object |
| [callback] | <code>function</code> | A function that is passed `(error, subscribed)` where `subscribed` is `true` or `false` |

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

### mbedConnectorApi.deleteResourceSubscription(endpoint, resource, [options], [callback])
DELETEs a resource's subscription

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  

| Param | Type | Description |
| --- | --- | --- |
| endpoint | <code>string</code> | The name of the endpoint |
| resource | <code>string</code> | The path to the resource |
| [options] | <code>Object</code> | Optional options object |
| [callback] | <code>function</code> | A function that is passed a potential `error` object |

<a name="mbedConnectorApi+getEndpointSubscriptions"></a>

### mbedConnectorApi.getEndpointSubscriptions(endpoint, [options], [callback])
Gets a list of an endpoint's subscriptions

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  

| Param | Type | Description |
| --- | --- | --- |
| endpoint | <code>string</code> | The name of the endpoint |
| [options] | <code>Object</code> | Optional options object |
| [callback] | <code>function</code> | A function that is passed `(error, subscriptions)` |

<a name="mbedConnectorApi+deleteEndpointSubscriptions"></a>

### mbedConnectorApi.deleteEndpointSubscriptions(endpoint, [options], [callback])
Removes an endpoint's subscriptions

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  

| Param | Type | Description |
| --- | --- | --- |
| endpoint | <code>string</code> | The name of the endpoint |
| [options] | <code>Object</code> | Optional options object |
| [callback] | <code>function</code> | A function that is passed a potential `error` object |

<a name="mbedConnectorApi+deleteAllSubscriptions"></a>

### mbedConnectorApi.deleteAllSubscriptions([callback])
Removes all subscriptions

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>function</code> | A function that is passed a potential `error` object |

<a name="mbedConnectorApi+getPreSubscription"></a>

### mbedConnectorApi.getPreSubscription([options], [callback])
GETs pre-subscription data

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>Object</code> | Optional options object |
| [callback] | <code>function</code> | A function that is passed `(error, data)` |

<a name="mbedConnectorApi+putPreSubscription"></a>

### mbedConnectorApi.putPreSubscription(data, [options], [callback])
PUTs pre-subscription data

**Kind**: instance method of <code>[mbedConnectorApi](#mbedConnectorApi)</code>  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | The pre-subscription data |
| [options] | <code>Object</code> | Optional options object |
| [callback] | <code>function</code> | A function that is passed a potential `error` object |

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

