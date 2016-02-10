<a name="mbedConnector"></a>
## mbedConnector
**Kind**: global class  

* [mbedConnector](#mbedConnector)
    * [new mbedConnector([options])](#new_mbedConnector_new)
    * [.getEndpoints(callback, [options])](#mbedConnector+getEndpoints)
    * [.getResources(endpoint, callback, [options])](#mbedConnector+getResources)
    * [.getResourceValue(endpoint, resource, callback, [options])](#mbedConnector+getResourceValue)
    * [.putResourceValue(endpoint, resource, value, callback, [options])](#mbedConnector+putResourceValue)
    * [.postResource(endpoint, resource, value, callback, [options])](#mbedConnector+postResource)
    * [.deleteEndpoint(endpoint, callback, [options])](#mbedConnector+deleteEndpoint)
    * [.getLimits(callback, [options])](#mbedConnector+getLimits)
    * [.getApiVersions(callback, [options])](#mbedConnector+getApiVersions)
    * [.getConnectorVersion(callback, [options])](#mbedConnector+getConnectorVersion)
    * [.getCallback(callback, [options])](#mbedConnector+getCallback)
    * [.putCallback(data, callback, [options])](#mbedConnector+putCallback)
    * [.deleteCallback(callback, [options])](#mbedConnector+deleteCallback)
    * [.startLongPolling(callback, [options])](#mbedConnector+startLongPolling)
    * [.stopLongPolling()](#mbedConnector+stopLongPolling)
    * [.getResourceSubscription(endpoint, resource, callback, [options])](#mbedConnector+getResourceSubscription)
    * [.putResourceSubscription(endpoint, resource, callback, [options])](#mbedConnector+putResourceSubscription)
    * [.deleteResourceSubscription(endpoint, resource, callback, [options])](#mbedConnector+deleteResourceSubscription)
    * [.getEndpointSubscriptions(endpoint, callback, [options])](#mbedConnector+getEndpointSubscriptions)
    * [.deleteEndpointSubscriptions(endpoint, callback, [options])](#mbedConnector+deleteEndpointSubscriptions)
    * [.deleteAllSubscriptions(callback)](#mbedConnector+deleteAllSubscriptions)
    * [.getPreSubscription(callback, [options])](#mbedConnector+getPreSubscription)
    * [.putPreSubscription(data, callback, [options])](#mbedConnector+putPreSubscription)

<a name="new_mbedConnector_new"></a>
### new mbedConnector([options])
Represents an mbed Connector REST API Client


| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>Object</code> | Optional options object |

<a name="mbedConnector+getEndpoints"></a>
### mbedConnector.getEndpoints(callback, [options])
Gets a list of currently registered endpoints

**Kind**: instance method of <code>[mbedConnector](#mbedConnector)</code>  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | A function that is passed the arguments `(error, endpoints)` |
| [options] | <code>Object</code> | Optional options object |
| [options.parameters.type] | <code>string</code> | Filters endpoints by endpoint-type |

<a name="mbedConnector+getResources"></a>
### mbedConnector.getResources(endpoint, callback, [options])
Gets a list of an endpoint's resources

**Kind**: instance method of <code>[mbedConnector](#mbedConnector)</code>  

| Param | Type | Description |
| --- | --- | --- |
| endpoint | <code>string</code> | The name of the endpoint |
| callback | <code>function</code> | A function that is passed the arguments `(error, resources)` |
| [options] | <code>Object</code> | Optional options object |

<a name="mbedConnector+getResourceValue"></a>
### mbedConnector.getResourceValue(endpoint, resource, callback, [options])
GETs the value of an endpoint's resource

**Kind**: instance method of <code>[mbedConnector](#mbedConnector)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| endpoint | <code>string</code> |  | The name of the endpoint |
| resource | <code>string</code> |  | The path to the resource |
| callback | <code>function</code> |  | A function that is passed the arguments `(error, value)` where `value` is the value of the resource formatted as a string. |
| [options] | <code>Object</code> |  | Optional options object |
| [options.parameters.cacheOnly] | <code>boolean</code> | <code>false</code> | If `true`, the response will come only from the cache |
| [options.parameters.noResp] | <code>boolean</code> | <code>false</code> | If `true`, Connector will not wait for a response. Creates a CoAP Non-Confirmable requests. If `false`, a response is expected and the CoAP request is confirmable. |

<a name="mbedConnector+putResourceValue"></a>
### mbedConnector.putResourceValue(endpoint, resource, value, callback, [options])
PUTs a value of an endpoint's resource

**Kind**: instance method of <code>[mbedConnector](#mbedConnector)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| endpoint | <code>string</code> |  | The name of the endpoint |
| resource | <code>string</code> |  | The path to the resource |
| value | <code>string</code> |  | The value of the resource |
| callback | <code>function</code> |  | A function that is passed a potential `error` object |
| [options] | <code>Object</code> |  | Optional options object |
| [options.parameters.cacheOnly] | <code>boolean</code> | <code>false</code> | If `true`, the response will come only from the cache |
| [options.parameters.noResp] | <code>boolean</code> | <code>false</code> | If `true`, Connector will not wait for a response. Creates a CoAP Non-Confirmable requests. If `false`, a response is expected and the CoAP request is confirmable. |

<a name="mbedConnector+postResource"></a>
### mbedConnector.postResource(endpoint, resource, value, callback, [options])
POSTs a value of an endpoint's resource

**Kind**: instance method of <code>[mbedConnector](#mbedConnector)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| endpoint | <code>string</code> |  | The name of the endpoint |
| resource | <code>string</code> |  | The path to the resource |
| value | <code>string</code> |  | The value of the resource (can be `null`) |
| callback | <code>function</code> |  | A function that is passed a potential `error` object |
| [options] | <code>Object</code> |  | Optional options object |
| [options.parameters.cacheOnly] | <code>boolean</code> | <code>false</code> | If `true`, the response will come only from the cache |
| [options.parameters.noResp] | <code>boolean</code> | <code>false</code> | If `true`, Connector will not wait for a response. Creates a CoAP Non-Confirmable requests. If `false`, a response is expected and the CoAP request is confirmable. |

<a name="mbedConnector+deleteEndpoint"></a>
### mbedConnector.deleteEndpoint(endpoint, callback, [options])
DELETEs an endpoint

**Kind**: instance method of <code>[mbedConnector](#mbedConnector)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| endpoint | <code>string</code> |  | The name of the endpoint |
| callback | <code>function</code> |  | A function that is passed a potential `error` object |
| [options] | <code>Object</code> |  | Optional options object |
| [options.parameters.cacheOnly] | <code>boolean</code> | <code>false</code> | If `true`, the response will come only from the cache |
| [options.parameters.noResp] | <code>boolean</code> | <code>false</code> | If `true`, Connector will not wait for a response. Creates a CoAP Non-Confirmable requests. If `false`, a response is expected and the CoAP request is confirmable. |

<a name="mbedConnector+getLimits"></a>
### mbedConnector.getLimits(callback, [options])
Gets the current traffic usage and limits of the mbed Connector account

**Kind**: instance method of <code>[mbedConnector](#mbedConnector)</code>  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | A function that is passed the arguments `(error, limits)` |
| [options] | <code>Object</code> | Optional options object |

<a name="mbedConnector+getApiVersions"></a>
### mbedConnector.getApiVersions(callback, [options])
Gets a list of the available REST API versions

**Kind**: instance method of <code>[mbedConnector](#mbedConnector)</code>  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | A function that is passed the arguments `(error, versions)` |
| [options] | <code>Object</code> | Optional options object |

<a name="mbedConnector+getConnectorVersion"></a>
### mbedConnector.getConnectorVersion(callback, [options])
Gets the current mbed Connector version

**Kind**: instance method of <code>[mbedConnector](#mbedConnector)</code>  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | A function that is passed the arguments `(error, version)` |
| [options] | <code>Object</code> | Optional options object |

<a name="mbedConnector+getCallback"></a>
### mbedConnector.getCallback(callback, [options])
GETs the current callback data

**Kind**: instance method of <code>[mbedConnector](#mbedConnector)</code>  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | A function that is passed the arguments `(error, callbackData)` where `callbackData` is an object containing a `url` string and a `headers` object |
| [options] | <code>Object</code> | Optional options object |

<a name="mbedConnector+putCallback"></a>
### mbedConnector.putCallback(data, callback, [options])
PUTs callback data

**Kind**: instance method of <code>[mbedConnector](#mbedConnector)</code>  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | The callback data |
| data.url | <code>string</code> | The callback URL |
| [data.headers] | <code>Object</code> | The headers that should be set when Connector PUTs to the given callback URL |
| callback | <code>function</code> | A function that is passed a potential `error` object |
| [options] | <code>Object</code> | Optional options object |

<a name="mbedConnector+deleteCallback"></a>
### mbedConnector.deleteCallback(callback, [options])
DELETEs the callback data (effectively stopping Connector from PUTing
notifications)

**Kind**: instance method of <code>[mbedConnector](#mbedConnector)</code>  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | A function that is passed a potential `error` object |
| [options] | <code>Object</code> | Optional options object |

<a name="mbedConnector+startLongPolling"></a>
### mbedConnector.startLongPolling(callback, [options])
Begins long polling constantly for notifications

**Kind**: instance method of <code>[mbedConnector](#mbedConnector)</code>  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | A function that is passed a potential `error` object |
| [options] | <code>Object</code> | Optional options object |

<a name="mbedConnector+stopLongPolling"></a>
### mbedConnector.stopLongPolling()
Stops long polling for notifications

**Kind**: instance method of <code>[mbedConnector](#mbedConnector)</code>  
<a name="mbedConnector+getResourceSubscription"></a>
### mbedConnector.getResourceSubscription(endpoint, resource, callback, [options])
GETs the status of a resource's subscription

**Kind**: instance method of <code>[mbedConnector](#mbedConnector)</code>  

| Param | Type | Description |
| --- | --- | --- |
| endpoint | <code>string</code> | The name of the endpoint |
| resource | <code>string</code> | The path to the resource |
| callback | <code>function</code> | A function that is passed `(error, subscribed)` where `subscribed` is `true` or `false` |
| [options] | <code>Object</code> | Optional options object |

<a name="mbedConnector+putResourceSubscription"></a>
### mbedConnector.putResourceSubscription(endpoint, resource, callback, [options])
PUTs a subscription to a resource

**Kind**: instance method of <code>[mbedConnector](#mbedConnector)</code>  

| Param | Type | Description |
| --- | --- | --- |
| endpoint | <code>string</code> | The name of the endpoint |
| resource | <code>string</code> | The path to the resource |
| callback | <code>function</code> | A function that is passed a potential `error` object |
| [options] | <code>Object</code> | Optional options object |

<a name="mbedConnector+deleteResourceSubscription"></a>
### mbedConnector.deleteResourceSubscription(endpoint, resource, callback, [options])
DELETEs a resource's subscription

**Kind**: instance method of <code>[mbedConnector](#mbedConnector)</code>  

| Param | Type | Description |
| --- | --- | --- |
| endpoint | <code>string</code> | The name of the endpoint |
| resource | <code>string</code> | The path to the resource |
| callback | <code>function</code> | A function that is passed a potential `error` object |
| [options] | <code>Object</code> | Optional options object |

<a name="mbedConnector+getEndpointSubscriptions"></a>
### mbedConnector.getEndpointSubscriptions(endpoint, callback, [options])
Gets a list of an endpoint's subscriptions

**Kind**: instance method of <code>[mbedConnector](#mbedConnector)</code>  

| Param | Type | Description |
| --- | --- | --- |
| endpoint | <code>string</code> | The name of the endpoint |
| callback | <code>function</code> | A function that is passed `(error, subscriptions)` |
| [options] | <code>Object</code> | Optional options object |

<a name="mbedConnector+deleteEndpointSubscriptions"></a>
### mbedConnector.deleteEndpointSubscriptions(endpoint, callback, [options])
Removes an endpoint's subscriptions

**Kind**: instance method of <code>[mbedConnector](#mbedConnector)</code>  

| Param | Type | Description |
| --- | --- | --- |
| endpoint | <code>string</code> | The name of the endpoint |
| callback | <code>function</code> | A function that is passed a potential `error` object |
| [options] | <code>Object</code> | Optional options object |

<a name="mbedConnector+deleteAllSubscriptions"></a>
### mbedConnector.deleteAllSubscriptions(callback)
Removes all subscriptions

**Kind**: instance method of <code>[mbedConnector](#mbedConnector)</code>  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | A function that is passed a potential `error` object |

<a name="mbedConnector+getPreSubscription"></a>
### mbedConnector.getPreSubscription(callback, [options])
GETs pre-subscription data

**Kind**: instance method of <code>[mbedConnector](#mbedConnector)</code>  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | A function that is passed `(error, data)` |
| [options] | <code>Object</code> | Optional options object |

<a name="mbedConnector+putPreSubscription"></a>
### mbedConnector.putPreSubscription(data, callback, [options])
PUTs pre-subscription data

**Kind**: instance method of <code>[mbedConnector](#mbedConnector)</code>  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | The pre-subscription data |
| callback | <code>function</code> | A function that is passed a potential `error` object |
| [options] | <code>Object</code> | Optional options object |

