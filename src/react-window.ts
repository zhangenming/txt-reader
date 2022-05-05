// @ts-nocheck
import { createElement, PureComponent } from 'react'
// node_modules/@babel/runtime/helpers/esm/extends.js
function _extends() {
    _extends =
        Object.assign ||
        function (target) {
            for (var i = 1; i < arguments.length; i++) {
                var source = arguments[i]
                for (var key in source) {
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        target[key] = source[key]
                    }
                }
            }
            return target
        }
    return _extends.apply(this, arguments)
}
// node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js
function _setPrototypeOf(o, p) {
    _setPrototypeOf =
        Object.setPrototypeOf ||
        function _setPrototypeOf2(o2, p2) {
            o2.__proto__ = p2
            return o2
        }
    return _setPrototypeOf(o, p)
}
// node_modules/@babel/runtime/helpers/esm/inheritsLoose.js
function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype)
    subClass.prototype.constructor = subClass
    _setPrototypeOf(subClass, superClass)
}
// node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js
function _assertThisInitialized(self) {
    if (self === void 0) {
        throw new ReferenceError(
            "this hasn't been initialised - super() hasn't been called"
        )
    }
    return self
}
// node_modules/memoize-one/dist/memoize-one.esm.js
var safeIsNaN =
    Number.isNaN ||
    function ponyfill(value) {
        return typeof value === 'number' && value !== value
    }
function isEqual(first, second) {
    if (first === second) {
        return true
    }
    if (safeIsNaN(first) && safeIsNaN(second)) {
        return true
    }
    return false
}
function areInputsEqual(newInputs, lastInputs) {
    if (newInputs.length !== lastInputs.length) {
        return false
    }
    for (var i = 0; i < newInputs.length; i++) {
        if (!isEqual(newInputs[i], lastInputs[i])) {
            return false
        }
    }
    return true
}
function memoizeOne(resultFn, isEqual2) {
    if (isEqual2 === void 0) {
        isEqual2 = areInputsEqual
    }
    var lastThis
    var lastArgs = []
    var lastResult
    var calledOnce = false
    function memoized() {
        var newArgs = []
        for (var _i = 0; _i < arguments.length; _i++) {
            newArgs[_i] = arguments[_i]
        }
        if (calledOnce && lastThis === this && isEqual2(newArgs, lastArgs)) {
            return lastResult
        }
        lastResult = resultFn.apply(this, newArgs)
        calledOnce = true
        lastThis = this
        lastArgs = newArgs
        return lastResult
    }
    return memoized
}

///
var hasNativePerformanceNow =
    typeof performance === 'object' && typeof performance.now === 'function'
var now = hasNativePerformanceNow
    ? function () {
          return performance.now()
      }
    : function () {
          return Date.now()
      }
function cancelTimeout(timeoutID) {
    cancelAnimationFrame(timeoutID.id)
}
function requestTimeout(callback, delay) {
    var start = now()

    function tick() {
        if (now() - start >= delay) {
            callback.call(null)
        } else {
            timeoutID.id = requestAnimationFrame(tick)
        }
    }

    var timeoutID = {
        id: requestAnimationFrame(tick),
    }
    return timeoutID
}

var size = -1 // This utility copied from "dom-helpers" package.
//1//1//1//1//1//1//1//1//1//1//1//1
function getScrollbarSize(recalculate) {
    if (recalculate === void 0) {
        recalculate = false
    }

    if (size === -1 || recalculate) {
        var div = document.createElement('div')
        var style = div.style
        style.width = '50px'
        style.height = '50px'
        style.overflow = 'scroll'
        document.body.appendChild(div)
        size = div.offsetWidth - div.clientWidth
        document.body.removeChild(div)
    }

    return size
}
var cachedRTLResult = null // TRICKY According to the spec, scrollLeft should be negative for RTL aligned elements.
// Chrome does not seem to adhere; its scrollLeft values are positive (measured relative to the left).
// Safari's elastic bounce makes detecting this even more complicated wrt potential false positives.
// The safest way to check this is to intentionally set a negative offset,
// and then verify that the subsequent "scroll" event matches the negative offset.
// If it does not match, then we can assume a non-standard RTL scroll implementation.

//1//1//1//1//1//1//1//1//1//1//1//1
function getRTLOffsetType(recalculate) {
    if (recalculate === void 0) {
        recalculate = false
    }

    if (cachedRTLResult === null || recalculate) {
        var outerDiv = document.createElement('div')
        var outerStyle = outerDiv.style
        outerStyle.width = '50px'
        outerStyle.height = '50px'
        outerStyle.overflow = 'scroll'
        outerStyle.direction = 'rtl'
        var innerDiv = document.createElement('div')
        var innerStyle = innerDiv.style
        innerStyle.width = '100px'
        innerStyle.height = '100px'
        outerDiv.appendChild(innerDiv)
        document.body.appendChild(outerDiv)

        if (outerDiv.scrollLeft > 0) {
            cachedRTLResult = 'positive-descending'
        } else {
            outerDiv.scrollLeft = 1

            if (outerDiv.scrollLeft === 0) {
                cachedRTLResult = 'negative'
            } else {
                cachedRTLResult = 'positive-ascending'
            }
        }

        document.body.removeChild(outerDiv)
        return cachedRTLResult
    }

    return cachedRTLResult
}

var IS_SCROLLING_DEBOUNCE_INTERVAL = 150

var defaultItemKey = function defaultItemKey(_ref) {
    var columnIndex = _ref.columnIndex,
        data = _ref.data,
        rowIndex = _ref.rowIndex
    return rowIndex + ':' + columnIndex
} // In DEV mode, this Set helps us only log a warning once per component instance.
// This avoids spamming the console every time a render happens.

var devWarningsOverscanCount = null
var devWarningsOverscanRowsColumnsCount = null
var devWarningsTagName = null

function createGridComponent(_ref2) {
    var _class, _temp

    var getColumnOffset = _ref2.getColumnOffset,
        getColumnStartIndexForOffset = _ref2.getColumnStartIndexForOffset,
        getColumnStopIndexForStartIndex = _ref2.getColumnStopIndexForStartIndex,
        getColumnWidth = _ref2.getColumnWidth,
        getEstimatedTotalHeight = _ref2.getEstimatedTotalHeight,
        getEstimatedTotalWidth = _ref2.getEstimatedTotalWidth,
        getOffsetForColumnAndAlignment = _ref2.getOffsetForColumnAndAlignment,
        getOffsetForRowAndAlignment = _ref2.getOffsetForRowAndAlignment,
        getRowHeight = _ref2.getRowHeight,
        getRowOffset = _ref2.getRowOffset,
        getRowStartIndexForOffset = _ref2.getRowStartIndexForOffset,
        getRowStopIndexForStartIndex = _ref2.getRowStopIndexForStartIndex,
        initInstanceProps = _ref2.initInstanceProps,
        shouldResetStyleCacheOnItemSizeChange =
            _ref2.shouldResetStyleCacheOnItemSizeChange,
        validateProps = _ref2.validateProps
    return (
        (_temp = _class =
            /*#__PURE__*/
            (function (_PureComponent) {
                _inheritsLoose(Grid, _PureComponent)

                // Always use explicit constructor for React components.
                // It produces less code after transpilation. (#26)
                // eslint-disable-next-line no-useless-constructor
                function Grid(props) {
                    var _this

                    _this = _PureComponent.call(this, props) || this
                    _this._instanceProps = initInstanceProps(
                        _this.props,
                        _assertThisInitialized(_assertThisInitialized(_this))
                    )
                    _this._resetIsScrollingTimeoutId = null
                    _this._outerRef = void 0
                    _this.state = {
                        instance: _assertThisInitialized(
                            _assertThisInitialized(_this)
                        ),
                        isScrolling: false,
                        horizontalScrollDirection: 'forward',
                        scrollLeft:
                            typeof _this.props.initialScrollLeft === 'number'
                                ? _this.props.initialScrollLeft
                                : 0,
                        scrollTop:
                            typeof _this.props.initialScrollTop === 'number'
                                ? _this.props.initialScrollTop
                                : 0,
                        scrollUpdateWasRequested: false,
                        verticalScrollDirection: 'forward',
                    }
                    _this._callOnItemsRendered = void 0
                    _this._callOnItemsRendered = memoizeOne(function (
                        overscanColumnStartIndex,
                        overscanColumnStopIndex,
                        overscanRowStartIndex,
                        overscanRowStopIndex,
                        visibleColumnStartIndex,
                        visibleColumnStopIndex,
                        visibleRowStartIndex,
                        visibleRowStopIndex
                    ) {
                        return _this.props.onItemsRendered({
                            overscanColumnStartIndex: overscanColumnStartIndex,
                            overscanColumnStopIndex: overscanColumnStopIndex,
                            overscanRowStartIndex: overscanRowStartIndex,
                            overscanRowStopIndex: overscanRowStopIndex,
                            visibleColumnStartIndex: visibleColumnStartIndex,
                            visibleColumnStopIndex: visibleColumnStopIndex,
                            visibleRowStartIndex: visibleRowStartIndex,
                            visibleRowStopIndex: visibleRowStopIndex,
                        })
                    })
                    _this._callOnScroll = void 0
                    _this._callOnScroll = memoizeOne(function (
                        scrollLeft,
                        scrollTop,
                        horizontalScrollDirection,
                        verticalScrollDirection,
                        scrollUpdateWasRequested
                    ) {
                        return _this.props.onScroll({
                            horizontalScrollDirection:
                                horizontalScrollDirection,
                            scrollLeft: scrollLeft,
                            scrollTop: scrollTop,
                            verticalScrollDirection: verticalScrollDirection,
                            scrollUpdateWasRequested: scrollUpdateWasRequested,
                        })
                    })
                    _this._getItemStyle = void 0

                    _this._getItemStyle = function (rowIndex, columnIndex) {
                        var _this$props = _this.props,
                            columnWidth = _this$props.columnWidth,
                            direction = _this$props.direction,
                            rowHeight = _this$props.rowHeight

                        var itemStyleCache = _this._getItemStyleCache(
                            shouldResetStyleCacheOnItemSizeChange &&
                                columnWidth,
                            shouldResetStyleCacheOnItemSizeChange && direction,
                            shouldResetStyleCacheOnItemSizeChange && rowHeight
                        )

                        var key = rowIndex + ':' + columnIndex
                        var style

                        if (itemStyleCache.hasOwnProperty(key)) {
                            style = itemStyleCache[key]
                        } else {
                            var _offset = getColumnOffset(
                                _this.props,
                                columnIndex,
                                _this._instanceProps
                            )

                            var isRtl = direction === 'rtl'
                            itemStyleCache[key] = style = {
                                left: isRtl ? undefined : _offset,
                                right: isRtl ? _offset : undefined,
                                top: getRowOffset(
                                    _this.props,
                                    rowIndex,
                                    _this._instanceProps
                                ),
                            }
                        }

                        return style
                    }

                    _this._getItemStyleCache = void 0
                    _this._getItemStyleCache = memoizeOne(function (
                        _,
                        __,
                        ___
                    ) {
                        return {}
                    })

                    _this._onScroll = function (event) {
                        var _event$currentTarget = event.currentTarget,
                            clientHeight = _event$currentTarget.clientHeight,
                            clientWidth = _event$currentTarget.clientWidth,
                            scrollLeft = _event$currentTarget.scrollLeft,
                            scrollTop = _event$currentTarget.scrollTop,
                            scrollHeight = _event$currentTarget.scrollHeight,
                            scrollWidth = _event$currentTarget.scrollWidth

                        _this.setState(function (prevState) {
                            if (
                                prevState.scrollLeft === scrollLeft &&
                                prevState.scrollTop === scrollTop
                            ) {
                                // Scroll position may have been updated by cDM/cDU,
                                // In which case we don't need to trigger another render,
                                // And we don't want to update state.isScrolling.
                                return null
                            }

                            var direction = _this.props.direction // TRICKY According to the spec, scrollLeft should be negative for RTL aligned elements.
                            // This is not the case for all browsers though (e.g. Chrome reports values as positive, measured relative to the left).
                            // It's also easier for this component if we convert offsets to the same format as they would be in for ltr.
                            // So the simplest solution is to determine which browser behavior we're dealing with, and convert based on it.

                            var calculatedScrollLeft = scrollLeft

                            if (direction === 'rtl') {
                                switch (getRTLOffsetType()) {
                                    case 'negative':
                                        calculatedScrollLeft = -scrollLeft
                                        break

                                    case 'positive-descending':
                                        calculatedScrollLeft =
                                            scrollWidth -
                                            clientWidth -
                                            scrollLeft
                                        break
                                }
                            } // Prevent Safari's elastic scrolling from causing visual shaking when scrolling past bounds.

                            calculatedScrollLeft = Math.max(
                                0,
                                Math.min(
                                    calculatedScrollLeft,
                                    scrollWidth - clientWidth
                                )
                            )
                            var calculatedScrollTop = Math.max(
                                0,
                                Math.min(scrollTop, scrollHeight - clientHeight)
                            )
                            return {
                                isScrolling: true,
                                horizontalScrollDirection:
                                    prevState.scrollLeft < scrollLeft
                                        ? 'forward'
                                        : 'backward',
                                scrollLeft: calculatedScrollLeft,
                                scrollTop: calculatedScrollTop,
                                verticalScrollDirection:
                                    prevState.scrollTop < scrollTop
                                        ? 'forward'
                                        : 'backward',
                                scrollUpdateWasRequested: false,
                            }
                        }, _this._resetIsScrollingDebounced)
                    }

                    _this._outerRefSetter = function (ref) {
                        var outerRef = _this.props.outerRef
                        _this._outerRef = ref

                        if (typeof outerRef === 'function') {
                            outerRef(ref)
                        } else if (
                            outerRef != null &&
                            typeof outerRef === 'object' &&
                            outerRef.hasOwnProperty('current')
                        ) {
                            outerRef.current = ref
                        }
                    }

                    _this._resetIsScrollingDebounced = function () {
                        if (_this._resetIsScrollingTimeoutId !== null) {
                            cancelTimeout(_this._resetIsScrollingTimeoutId)
                        }

                        _this._resetIsScrollingTimeoutId = requestTimeout(
                            _this._resetIsScrolling,
                            IS_SCROLLING_DEBOUNCE_INTERVAL
                        )
                    }

                    _this._resetIsScrolling = function () {
                        _this._resetIsScrollingTimeoutId = null

                        _this.setState(
                            {
                                isScrolling: false,
                            },
                            function () {
                                // Clear style cache after state update has been committed.
                                // This way we don't break pure sCU for items that don't use isScrolling param.
                                _this._getItemStyleCache(-1)
                            }
                        )
                    }

                    return _this
                }

                Grid.getDerivedStateFromProps =
                    function getDerivedStateFromProps(nextProps, prevState) {
                        validateSharedProps(nextProps, prevState)
                        validateProps(nextProps)
                        return null
                    }

                var _proto = Grid.prototype

                _proto.scrollTo = function scrollTo(_ref3) {
                    var scrollLeft = _ref3.scrollLeft,
                        scrollTop = _ref3.scrollTop

                    if (scrollLeft !== undefined) {
                        scrollLeft = Math.max(0, scrollLeft)
                    }

                    if (scrollTop !== undefined) {
                        scrollTop = Math.max(0, scrollTop)
                    }

                    this.setState(function (prevState) {
                        if (scrollLeft === undefined) {
                            scrollLeft = prevState.scrollLeft
                        }

                        if (scrollTop === undefined) {
                            scrollTop = prevState.scrollTop
                        }

                        if (
                            prevState.scrollLeft === scrollLeft &&
                            prevState.scrollTop === scrollTop
                        ) {
                            return null
                        }

                        return {
                            horizontalScrollDirection:
                                prevState.scrollLeft < scrollLeft
                                    ? 'forward'
                                    : 'backward',
                            scrollLeft: scrollLeft,
                            scrollTop: scrollTop,
                            scrollUpdateWasRequested: true,
                            verticalScrollDirection:
                                prevState.scrollTop < scrollTop
                                    ? 'forward'
                                    : 'backward',
                        }
                    }, this._resetIsScrollingDebounced)
                }

                _proto.scrollToItem = function scrollToItem(_ref4) {
                    var _ref4$align = _ref4.align,
                        align = _ref4$align === void 0 ? 'auto' : _ref4$align,
                        columnIndex = _ref4.columnIndex,
                        rowIndex = _ref4.rowIndex
                    var _this$props2 = this.props,
                        columnCount = _this$props2.columnCount,
                        height = _this$props2.height,
                        rowCount = _this$props2.rowCount,
                        width = _this$props2.width
                    var _this$state = this.state,
                        scrollLeft = _this$state.scrollLeft,
                        scrollTop = _this$state.scrollTop
                    var scrollbarSize = getScrollbarSize()

                    if (columnIndex !== undefined) {
                        columnIndex = Math.max(
                            0,
                            Math.min(columnIndex, columnCount - 1)
                        )
                    }

                    if (rowIndex !== undefined) {
                        rowIndex = Math.max(0, Math.min(rowIndex, rowCount - 1))
                    }

                    var estimatedTotalHeight = getEstimatedTotalHeight(
                        this.props,
                        this._instanceProps
                    )
                    var estimatedTotalWidth = getEstimatedTotalWidth(
                        this.props,
                        this._instanceProps
                    ) // The scrollbar size should be considered when scrolling an item into view,
                    // to ensure it's fully visible.
                    // But we only need to account for its size when it's actually visible.

                    var horizontalScrollbarSize =
                        estimatedTotalWidth > width ? scrollbarSize : 0
                    var verticalScrollbarSize =
                        estimatedTotalHeight > height ? scrollbarSize : 0
                    this.scrollTo({
                        scrollLeft:
                            columnIndex !== undefined
                                ? getOffsetForColumnAndAlignment(
                                      this.props,
                                      columnIndex,
                                      align,
                                      scrollLeft,
                                      this._instanceProps,
                                      verticalScrollbarSize
                                  )
                                : scrollLeft,
                        scrollTop:
                            rowIndex !== undefined
                                ? getOffsetForRowAndAlignment(
                                      this.props,
                                      rowIndex,
                                      align,
                                      scrollTop,
                                      this._instanceProps,
                                      horizontalScrollbarSize
                                  )
                                : scrollTop,
                    })
                }

                _proto.componentDidMount = function componentDidMount() {
                    var _this$props3 = this.props,
                        initialScrollLeft = _this$props3.initialScrollLeft,
                        initialScrollTop = _this$props3.initialScrollTop

                    if (this._outerRef != null) {
                        var outerRef = this._outerRef

                        if (typeof initialScrollLeft === 'number') {
                            outerRef.scrollLeft = initialScrollLeft
                        }

                        if (typeof initialScrollTop === 'number') {
                            outerRef.scrollTop = initialScrollTop
                        }
                    }

                    this._callPropsCallbacks()
                }

                _proto.componentDidUpdate = function componentDidUpdate() {
                    var direction = this.props.direction
                    var _this$state2 = this.state,
                        scrollLeft = _this$state2.scrollLeft,
                        scrollTop = _this$state2.scrollTop,
                        scrollUpdateWasRequested =
                            _this$state2.scrollUpdateWasRequested

                    if (scrollUpdateWasRequested && this._outerRef != null) {
                        // TRICKY According to the spec, scrollLeft should be negative for RTL aligned elements.
                        // This is not the case for all browsers though (e.g. Chrome reports values as positive, measured relative to the left).
                        // So we need to determine which browser behavior we're dealing with, and mimic it.
                        var outerRef = this._outerRef

                        if (direction === 'rtl') {
                            switch (getRTLOffsetType()) {
                                case 'negative':
                                    outerRef.scrollLeft = -scrollLeft
                                    break

                                case 'positive-ascending':
                                    outerRef.scrollLeft = scrollLeft
                                    break

                                default:
                                    var clientWidth = outerRef.clientWidth,
                                        scrollWidth = outerRef.scrollWidth
                                    outerRef.scrollLeft =
                                        scrollWidth - clientWidth - scrollLeft
                                    break
                            }
                        } else {
                            outerRef.scrollLeft = Math.max(0, scrollLeft)
                        }

                        outerRef.scrollTop = Math.max(0, scrollTop)
                    }

                    this._callPropsCallbacks()
                }

                _proto.componentWillUnmount = function componentWillUnmount() {
                    if (this._resetIsScrollingTimeoutId !== null) {
                        cancelTimeout(this._resetIsScrollingTimeoutId)
                    }
                }

                _proto.render = function render() {
                    var _this$props4 = this.props,
                        children = _this$props4.children,
                        className = _this$props4.className,
                        columnCount = _this$props4.columnCount,
                        direction = _this$props4.direction,
                        height = _this$props4.height,
                        innerRef = _this$props4.innerRef,
                        innerElementType = _this$props4.innerElementType,
                        innerTagName = _this$props4.innerTagName,
                        itemData = _this$props4.itemData,
                        _this$props4$itemKey = _this$props4.itemKey,
                        itemKey =
                            _this$props4$itemKey === void 0
                                ? defaultItemKey
                                : _this$props4$itemKey,
                        outerElementType = _this$props4.outerElementType,
                        outerTagName = _this$props4.outerTagName,
                        rowCount = _this$props4.rowCount,
                        style = _this$props4.style,
                        useIsScrolling = _this$props4.useIsScrolling,
                        width = _this$props4.width
                    var isScrolling = this.state.isScrolling

                    var _this$_getHorizontalR =
                            this._getHorizontalRangeToRender(),
                        columnStartIndex = _this$_getHorizontalR[0],
                        columnStopIndex = _this$_getHorizontalR[1]

                    var _this$_getVerticalRan =
                            this._getVerticalRangeToRender(),
                        rowStartIndex = _this$_getVerticalRan[0],
                        rowStopIndex = _this$_getVerticalRan[1]

                    var items = []

                    if (columnCount > 0 && rowCount) {
                        for (
                            var _rowIndex = rowStartIndex;
                            _rowIndex <= rowStopIndex;
                            _rowIndex++
                        ) {
                            for (
                                var _columnIndex = columnStartIndex;
                                _columnIndex <= columnStopIndex;
                                _columnIndex++
                            ) {
                                items.push(
                                    createElement(children, {
                                        columnIndex: _columnIndex,
                                        data: itemData,
                                        isScrolling: useIsScrolling
                                            ? isScrolling
                                            : undefined,
                                        key: itemKey({
                                            columnIndex: _columnIndex,
                                            data: itemData,
                                            rowIndex: _rowIndex,
                                        }),
                                        rowIndex: _rowIndex,
                                        style: this._getItemStyle(
                                            _rowIndex,
                                            _columnIndex
                                        ),
                                    })
                                )
                            }
                        }
                    } // Read this value AFTER items have been created,
                    // So their actual sizes (if variable) are taken into consideration.

                    var estimatedTotalHeight = getEstimatedTotalHeight(
                        this.props,
                        this._instanceProps
                    )
                    var estimatedTotalWidth = getEstimatedTotalWidth(
                        this.props,
                        this._instanceProps
                    )
                    return createElement(
                        outerElementType || outerTagName || 'div',
                        {
                            className: className,
                            onScroll: this._onScroll,
                            ref: this._outerRefSetter,
                            style: _extends(
                                {
                                    height: height,
                                    width: width,
                                    WebkitOverflowScrolling: 'touch',
                                },
                                style
                            ),
                        },
                        createElement(
                            innerElementType || innerTagName || 'div',
                            {
                                children: items,
                                ref: innerRef,
                                style: {
                                    height: estimatedTotalHeight,
                                    // pointerEvents: isScrolling
                                    //     ? 'none'
                                    //     : undefined,
                                    width: estimatedTotalWidth,
                                },
                            }
                        )
                    )
                }

                _proto._callPropsCallbacks = function _callPropsCallbacks() {
                    var _this$props5 = this.props,
                        columnCount = _this$props5.columnCount,
                        onItemsRendered = _this$props5.onItemsRendered,
                        onScroll = _this$props5.onScroll,
                        rowCount = _this$props5.rowCount

                    if (typeof onItemsRendered === 'function') {
                        if (columnCount > 0 && rowCount > 0) {
                            var _this$_getHorizontalR2 =
                                    this._getHorizontalRangeToRender(),
                                _overscanColumnStartIndex =
                                    _this$_getHorizontalR2[0],
                                _overscanColumnStopIndex =
                                    _this$_getHorizontalR2[1],
                                _visibleColumnStartIndex =
                                    _this$_getHorizontalR2[2],
                                _visibleColumnStopIndex =
                                    _this$_getHorizontalR2[3]

                            var _this$_getVerticalRan2 =
                                    this._getVerticalRangeToRender(),
                                _overscanRowStartIndex =
                                    _this$_getVerticalRan2[0],
                                _overscanRowStopIndex =
                                    _this$_getVerticalRan2[1],
                                _visibleRowStartIndex =
                                    _this$_getVerticalRan2[2],
                                _visibleRowStopIndex = _this$_getVerticalRan2[3]

                            this._callOnItemsRendered(
                                _overscanColumnStartIndex,
                                _overscanColumnStopIndex,
                                _overscanRowStartIndex,
                                _overscanRowStopIndex,
                                _visibleColumnStartIndex,
                                _visibleColumnStopIndex,
                                _visibleRowStartIndex,
                                _visibleRowStopIndex
                            )
                        }
                    }

                    if (typeof onScroll === 'function') {
                        var _this$state3 = this.state,
                            _horizontalScrollDirection =
                                _this$state3.horizontalScrollDirection,
                            _scrollLeft = _this$state3.scrollLeft,
                            _scrollTop = _this$state3.scrollTop,
                            _scrollUpdateWasRequested =
                                _this$state3.scrollUpdateWasRequested,
                            _verticalScrollDirection =
                                _this$state3.verticalScrollDirection

                        this._callOnScroll(
                            _scrollLeft,
                            _scrollTop,
                            _horizontalScrollDirection,
                            _verticalScrollDirection,
                            _scrollUpdateWasRequested
                        )
                    }
                } // Lazily create and cache item styles while scrolling,
                // So that pure component sCU will prevent re-renders.
                // We maintain this cache, and pass a style prop rather than index,
                // So that List can clear cached styles and force item re-render if necessary.

                _proto._getHorizontalRangeToRender =
                    function _getHorizontalRangeToRender() {
                        var _this$props6 = this.props,
                            columnCount = _this$props6.columnCount,
                            overscanColumnCount =
                                _this$props6.overscanColumnCount,
                            overscanColumnsCount =
                                _this$props6.overscanColumnsCount,
                            overscanCount = _this$props6.overscanCount,
                            rowCount = _this$props6.rowCount
                        var _this$state4 = this.state,
                            horizontalScrollDirection =
                                _this$state4.horizontalScrollDirection,
                            isScrolling = _this$state4.isScrolling,
                            scrollLeft = _this$state4.scrollLeft
                        var overscanCountResolved =
                            overscanColumnCount ||
                            overscanColumnsCount ||
                            overscanCount ||
                            1

                        if (columnCount === 0 || rowCount === 0) {
                            return [0, 0, 0, 0]
                        }

                        var startIndex = getColumnStartIndexForOffset(
                            this.props,
                            scrollLeft,
                            this._instanceProps
                        )
                        var stopIndex = getColumnStopIndexForStartIndex(
                            this.props,
                            startIndex,
                            scrollLeft,
                            this._instanceProps
                        ) // Overscan by one item in each direction so that tab/focus works.
                        // If there isn't at least one extra item, tab loops back around.

                        var overscanBackward =
                            !isScrolling ||
                            horizontalScrollDirection === 'backward'
                                ? Math.max(1, overscanCountResolved)
                                : 1
                        var overscanForward =
                            !isScrolling ||
                            horizontalScrollDirection === 'forward'
                                ? Math.max(1, overscanCountResolved)
                                : 1
                        return [
                            Math.max(0, startIndex - overscanBackward),
                            Math.max(
                                0,
                                Math.min(
                                    columnCount - 1,
                                    stopIndex + overscanForward
                                )
                            ),
                            startIndex,
                            stopIndex,
                        ]
                    }

                _proto._getVerticalRangeToRender =
                    function _getVerticalRangeToRender() {
                        var _this$props7 = this.props,
                            columnCount = _this$props7.columnCount,
                            overscanCount = _this$props7.overscanCount,
                            overscanRowCount = _this$props7.overscanRowCount,
                            overscanRowsCount = _this$props7.overscanRowsCount,
                            rowCount = _this$props7.rowCount
                        var _this$state5 = this.state,
                            isScrolling = _this$state5.isScrolling,
                            verticalScrollDirection =
                                _this$state5.verticalScrollDirection,
                            scrollTop = _this$state5.scrollTop
                        var overscanCountResolved =
                            overscanRowCount ||
                            overscanRowsCount ||
                            overscanCount ||
                            1

                        if (columnCount === 0 || rowCount === 0) {
                            return [0, 0, 0, 0]
                        }

                        var startIndex = getRowStartIndexForOffset(
                            this.props,
                            scrollTop,
                            this._instanceProps
                        )
                        var stopIndex = getRowStopIndexForStartIndex(
                            this.props,
                            startIndex,
                            scrollTop,
                            this._instanceProps
                        ) // Overscan by one item in each direction so that tab/focus works.
                        // If there isn't at least one extra item, tab loops back around.

                        var overscanBackward =
                            !isScrolling ||
                            verticalScrollDirection === 'backward'
                                ? Math.max(1, overscanCountResolved)
                                : 1
                        var overscanForward =
                            !isScrolling ||
                            verticalScrollDirection === 'forward'
                                ? Math.max(1, overscanCountResolved)
                                : 1
                        return [
                            Math.max(0, startIndex - overscanBackward),
                            Math.max(
                                0,
                                Math.min(
                                    rowCount - 1,
                                    stopIndex + overscanForward
                                )
                            ),
                            startIndex,
                            stopIndex,
                        ]
                    }

                return Grid
            })(PureComponent)),
        (_class.defaultProps = {
            direction: 'ltr',
            itemData: undefined,
            useIsScrolling: false,
        }),
        _temp
    )
}

var validateSharedProps = function validateSharedProps(_ref5, _ref6) {
    var children = _ref5.children,
        direction = _ref5.direction,
        height = _ref5.height,
        innerTagName = _ref5.innerTagName,
        outerTagName = _ref5.outerTagName,
        overscanColumnsCount = _ref5.overscanColumnsCount,
        overscanCount = _ref5.overscanCount,
        overscanRowsCount = _ref5.overscanRowsCount,
        width = _ref5.width
    var instance = _ref6.instance

    if (process.env.NODE_ENV !== 'production') {
        if (typeof overscanCount === 'number') {
            if (
                devWarningsOverscanCount &&
                !devWarningsOverscanCount.has(instance)
            ) {
                devWarningsOverscanCount.add(instance)
                console.warn(
                    'The overscanCount prop has been deprecated. ' +
                        'Please use the overscanColumnCount and overscanRowCount props instead.'
                )
            }
        }

        if (
            typeof overscanColumnsCount === 'number' ||
            typeof overscanRowsCount === 'number'
        ) {
            if (
                devWarningsOverscanRowsColumnsCount &&
                !devWarningsOverscanRowsColumnsCount.has(instance)
            ) {
                devWarningsOverscanRowsColumnsCount.add(instance)
                console.warn(
                    'The overscanColumnsCount and overscanRowsCount props have been deprecated. ' +
                        'Please use the overscanColumnCount and overscanRowCount props instead.'
                )
            }
        }

        if (innerTagName != null || outerTagName != null) {
            if (devWarningsTagName && !devWarningsTagName.has(instance)) {
                devWarningsTagName.add(instance)
                console.warn(
                    'The innerTagName and outerTagName props have been deprecated. ' +
                        'Please use the innerElementType and outerElementType props instead.'
                )
            }
        }

        if (children == null) {
            throw Error(
                'An invalid "children" prop has been specified. ' +
                    'Value should be a React component. ' +
                    ('"' +
                        (children === null ? 'null' : typeof children) +
                        '" was specified.')
            )
        }

        switch (direction) {
            case 'ltr':
            case 'rtl':
                // Valid values
                break

            default:
                throw Error(
                    'An invalid "direction" prop has been specified. ' +
                        'Value should be either "ltr" or "rtl". ' +
                        ('"' + direction + '" was specified.')
                )
        }

        if (typeof width !== 'number') {
            throw Error(
                'An invalid "width" prop has been specified. ' +
                    'Grids must specify a number for width. ' +
                    ('"' +
                        (width === null ? 'null' : typeof width) +
                        '" was specified.')
            )
        }

        if (typeof height !== 'number') {
            throw Error(
                'An invalid "height" prop has been specified. ' +
                    'Grids must specify a number for height. ' +
                    ('"' +
                        (height === null ? 'null' : typeof height) +
                        '" was specified.')
            )
        }
    }
}

export const FixedSizeGrid =
    /*#__PURE__*/
    createGridComponent({
        getColumnOffset: function getColumnOffset(_ref, index) {
            var columnWidth = _ref.columnWidth
            return index * columnWidth
        },
        getColumnWidth: function getColumnWidth(_ref2, index) {
            var columnWidth = _ref2.columnWidth
            return columnWidth
        },
        getRowOffset: function getRowOffset(_ref3, index) {
            var rowHeight = _ref3.rowHeight
            return index * rowHeight
        },
        getRowHeight: function getRowHeight(_ref4, index) {
            var rowHeight = _ref4.rowHeight
            return rowHeight
        },
        getEstimatedTotalHeight: function getEstimatedTotalHeight(_ref5) {
            var rowCount = _ref5.rowCount,
                rowHeight = _ref5.rowHeight
            return rowHeight * rowCount
        },
        getEstimatedTotalWidth: function getEstimatedTotalWidth(_ref6) {
            var columnCount = _ref6.columnCount,
                columnWidth = _ref6.columnWidth
            return columnWidth * columnCount
        },
        getOffsetForColumnAndAlignment: function getOffsetForColumnAndAlignment(
            _ref7,
            columnIndex,
            align,
            scrollLeft,
            instanceProps,
            scrollbarSize
        ) {
            var columnCount = _ref7.columnCount,
                columnWidth = _ref7.columnWidth,
                width = _ref7.width
            var lastColumnOffset = Math.max(
                0,
                columnCount * columnWidth - width
            )
            var maxOffset = Math.min(
                lastColumnOffset,
                columnIndex * columnWidth
            )
            var minOffset = Math.max(
                0,
                columnIndex * columnWidth - width + scrollbarSize + columnWidth
            )

            if (align === 'smart') {
                if (
                    scrollLeft >= minOffset - width &&
                    scrollLeft <= maxOffset + width
                ) {
                    align = 'auto'
                } else {
                    align = 'center'
                }
            }

            switch (align) {
                case 'start':
                    return maxOffset

                case 'end':
                    return minOffset

                case 'center':
                    // "Centered" offset is usually the average of the min and max.
                    // But near the edges of the list, this doesn't hold true.
                    var middleOffset = Math.round(
                        minOffset + (maxOffset - minOffset) / 2
                    )

                    if (middleOffset < Math.ceil(width / 2)) {
                        return 0 // near the beginning
                    } else if (
                        middleOffset >
                        lastColumnOffset + Math.floor(width / 2)
                    ) {
                        return lastColumnOffset // near the end
                    } else {
                        return middleOffset
                    }

                case 'auto':
                default:
                    if (scrollLeft >= minOffset && scrollLeft <= maxOffset) {
                        return scrollLeft
                    } else if (minOffset > maxOffset) {
                        // Because we only take into account the scrollbar size when calculating minOffset
                        // this value can be larger than maxOffset when at the end of the list
                        return minOffset
                    } else if (scrollLeft < minOffset) {
                        return minOffset
                    } else {
                        return maxOffset
                    }
            }
        },
        getOffsetForRowAndAlignment: function getOffsetForRowAndAlignment(
            _ref8,
            rowIndex,
            align,
            scrollTop,
            instanceProps,
            scrollbarSize
        ) {
            var rowHeight = _ref8.rowHeight,
                height = _ref8.height,
                rowCount = _ref8.rowCount
            var lastRowOffset = Math.max(0, rowCount * rowHeight - height)
            var maxOffset = Math.min(lastRowOffset, rowIndex * rowHeight)
            var minOffset = Math.max(
                0,
                rowIndex * rowHeight - height + scrollbarSize + rowHeight
            )

            if (align === 'smart') {
                if (
                    scrollTop >= minOffset - height &&
                    scrollTop <= maxOffset + height
                ) {
                    align = 'auto'
                } else {
                    align = 'center'
                }
            }

            switch (align) {
                case 'start':
                    return maxOffset

                case 'end':
                    return minOffset

                case 'center':
                    // "Centered" offset is usually the average of the min and max.
                    // But near the edges of the list, this doesn't hold true.
                    var middleOffset = Math.round(
                        minOffset + (maxOffset - minOffset) / 2
                    )

                    if (middleOffset < Math.ceil(height / 2)) {
                        return 0 // near the beginning
                    } else if (
                        middleOffset >
                        lastRowOffset + Math.floor(height / 2)
                    ) {
                        return lastRowOffset // near the end
                    } else {
                        return middleOffset
                    }

                case 'auto':
                default:
                    if (scrollTop >= minOffset && scrollTop <= maxOffset) {
                        return scrollTop
                    } else if (minOffset > maxOffset) {
                        // Because we only take into account the scrollbar size when calculating minOffset
                        // this value can be larger than maxOffset when at the end of the list
                        return minOffset
                    } else if (scrollTop < minOffset) {
                        return minOffset
                    } else {
                        return maxOffset
                    }
            }
        },
        getColumnStartIndexForOffset: function getColumnStartIndexForOffset(
            _ref9,
            scrollLeft
        ) {
            var columnWidth = _ref9.columnWidth,
                columnCount = _ref9.columnCount
            return Math.max(
                0,
                Math.min(columnCount - 1, Math.floor(scrollLeft / columnWidth))
            )
        },
        getColumnStopIndexForStartIndex:
            function getColumnStopIndexForStartIndex(
                _ref10,
                startIndex,
                scrollLeft
            ) {
                var columnWidth = _ref10.columnWidth,
                    columnCount = _ref10.columnCount,
                    width = _ref10.width
                var left = startIndex * columnWidth
                var numVisibleColumns = Math.ceil(
                    (width + scrollLeft - left) / columnWidth
                )
                return Math.max(
                    0,
                    Math.min(
                        columnCount - 1,
                        startIndex + numVisibleColumns - 1 // -1 is because stop index is inclusive
                    )
                )
            },
        getRowStartIndexForOffset: function getRowStartIndexForOffset(
            _ref11,
            scrollTop
        ) {
            var rowHeight = _ref11.rowHeight,
                rowCount = _ref11.rowCount
            return Math.max(
                0,
                Math.min(rowCount - 1, Math.floor(scrollTop / rowHeight))
            )
        },
        getRowStopIndexForStartIndex: function getRowStopIndexForStartIndex(
            _ref12,
            startIndex,
            scrollTop
        ) {
            var rowHeight = _ref12.rowHeight,
                rowCount = _ref12.rowCount,
                height = _ref12.height
            var top = startIndex * rowHeight
            var numVisibleRows = Math.ceil(
                (height + scrollTop - top) / rowHeight
            )
            return Math.max(
                0,
                Math.min(
                    rowCount - 1,
                    startIndex + numVisibleRows - 1 // -1 is because stop index is inclusive
                )
            )
        },
        initInstanceProps: function initInstanceProps(props) {
            // Noop
        },
        shouldResetStyleCacheOnItemSizeChange: true,
        validateProps: function validateProps(_ref13) {
            var columnWidth = _ref13.columnWidth,
                rowHeight = _ref13.rowHeight

            if (process.env.NODE_ENV !== 'production') {
                if (typeof columnWidth !== 'number') {
                    throw Error(
                        'An invalid "columnWidth" prop has been specified. ' +
                            'Value should be a number. ' +
                            ('"' +
                                (columnWidth === null
                                    ? 'null'
                                    : typeof columnWidth) +
                                '" was specified.')
                    )
                }

                if (typeof rowHeight !== 'number') {
                    throw Error(
                        'An invalid "rowHeight" prop has been specified. ' +
                            'Value should be a number. ' +
                            ('"' +
                                (rowHeight === null
                                    ? 'null'
                                    : typeof rowHeight) +
                                '" was specified.')
                    )
                }
            }
        },
    })

function shallowDiffers(prev: Object, next: Object): boolean {
    for (let attribute in prev) {
        if (!(attribute in next)) {
            return true
        }
    }
    for (let attribute in next) {
        if (prev[attribute] !== next[attribute]) {
            return true
        }
    }
    return false
}
export function areEqual(prevProps: Object, nextProps: Object): boolean {
    const { style: prevStyle, ...prevRest } = prevProps
    const { style: nextStyle, ...nextRest } = nextProps

    return (
        !shallowDiffers(prevStyle, nextStyle) &&
        !shallowDiffers(prevRest, nextRest)
    )
}
