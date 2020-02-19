import { findElements } from '@fullcalendar/core'
import { formatIsoDay } from '../datelib-utils'
import { getRectCenter, intersectRects, addPoints, subtractPoints } from '../geom'

export default class DayGridWrapper {

  static eventIsStartClassName = 'fc-start'
  static eventIsEndClassName = 'fc-end'


  constructor(private el: HTMLElement) {
  }


  getAllDayEls() {
    return findElements(this.el, '.fc-day[data-date]')
  }


  getDayEl(date) {
    if (typeof date === 'string') {
      date = new Date(date)
    }
    return this.el.querySelector('.fc-day[data-date="' + formatIsoDay(date) + '"]')
  }


  getDayEls(date) { // TODO: return single el
    if (typeof date === 'string') {
      date = new Date(date)
    }
    return findElements(this.el, '.fc-day[data-date="' + formatIsoDay(date) + '"]')
  }


  getDayNumberText(date) {
    if (typeof date === 'string') {
      date = new Date(date)
    }
    return $('.fc-day-top[data-date="' + formatIsoDay(date) + '"]', this.el).text()
  }


  getDayElsInRow(row) {
    return findElements(this.getRowEl(row), '.fc-day')
  }


  // TODO: discourage use
  getNonBusinessDayEls() {
    return findElements(this.el, '.fc-nonbusiness')
  }


  // TODO: discourage use
  getDowEls(dayAbbrev) {
    return findElements(this.el, `.fc-row:first-child td.fc-day.fc-${dayAbbrev}`)
  }


  getDisabledDayEls() {
    return findElements(this.el, '.fc-bg .fc-disabled-day')
  }


  getAxisEls() {
    return findElements(this.el, '.fc-axis')
  }


  getMoreEl() {
    return this.el.querySelector('.fc-more')
  }


  getMorePopoverEl() {
    return this.el.parentNode.querySelector('.fc-more-popover') // popover lives as a sibling
  }


  getMorePopoverTitle() {
    return $(this.getMorePopoverEl().querySelector('.fc-header .fc-title')).text()
  }


  getRowEl(i) {
    return this.el.querySelector(`.fc-row:nth-child(${i + 1})`) as HTMLElement // nth-child is 1-indexed!
  }


  getBgEventEls(row?) {
    let parentEl = row == null ? this.el : this.getRowEl(row)
    return findElements(parentEl, '.fc-bgevent')
  }


  getEventEls() { // FG events
    return findElements(this.el, '.fc-event')
  }


  dragEventToDate(eventEl: HTMLElement, startDate, endDate) {
    return new Promise((resolve) => {
      let rect0 = this.getDayEl(startDate).getBoundingClientRect()
      let rect1 = this.getDayEl(endDate).getBoundingClientRect()

      let eventRect = eventEl.getBoundingClientRect()
      let point0 = getRectCenter(intersectRects(eventRect, rect0))
      let point1 = getRectCenter(rect1)

      $(eventEl).simulate('drag', {
        point: point0,
        end: point1,
        onRelease: () => resolve()
      })
    })
  }


  resizeEvent(eventEl: HTMLElement, origEndDate, newEndDate, fromStart?) {
    return new Promise((resolve) => {
      let rect0 = this.getDayEl(origEndDate).getBoundingClientRect()
      let rect1 = this.getDayEl(newEndDate).getBoundingClientRect()

      $(eventEl).simulate('mouseover') // so that resize handle is revealed

      var resizerEl = eventEl.querySelector(fromStart ? '.fc-start-resizer' : '.fc-end-resizer')
      var resizerRect = resizerEl.getBoundingClientRect()
      var resizerCenter = getRectCenter(resizerRect)

      var vector = subtractPoints(resizerCenter, rect0)
      var endPoint = addPoints(rect1, vector)

      $(resizerEl).simulate('drag', {
        point: resizerCenter,
        end: endPoint,
        onRelease: () => resolve()
      })
    })
  }

}