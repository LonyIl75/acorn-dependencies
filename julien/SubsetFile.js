import {isBeginWith, majMinFirstCharStrRegexp} from "../acorn/src/julien/misc/_regexp.js"
import {getLabelFromTokenType} from "../acorn/src/tokentype.js"
import {types as tt} from "../acorn/src/mapTokentype.js"
import {notStr, strEd} from "../acorn/src/julien/primitives/String.js"
import {strArrToFieldName, isNotEmptyObject, s_getProp} from "../acorn/src/julien/primitives/Object.js"
import {isNotEmptyArray} from "../acorn/src/julien/primitives/Array.js"
import {str_props} from "../acorn/src/julien/token/configToken.js"

import fs from "fs"

export class SubsetFile {
    constructor(arr) {
      this.posArr = []
      this.ignoredPosArr = []
      this.initPosArr(arr)
    }

  initPosArr(arr) {
    if (isNotEmptyArray(arr)) {
      this.posArr.push(arr[0])
      for (let i = 1 ; i < arr.length ; i++) {
      if (!(arr[i - 1].end < arr[i].start)) this.addPos(arr[i])
      }
    }
  }

  setPosArr(arr) {
    this.posArr = arr
  }

  getPosArr() {
    return this.posArr
  }

  setIgnoredPosArr(arr) {
    this.ignoredPosArr = arr
  }

  getIgnoredPosArr() {
    return this.ignoredPosArr
  }

    addPosToArr(arr_pos, setArr, getArr, _b) {
        let idx_end = 0
        let idx_beg = -1
        let interval = null

      for (const pos of arr_pos) {
          let [new_start, new_end] = [pos.start, pos.end]
          if (_b && this.checkIsIgnoredPos(pos) >= 0) continue

          idx_end = 0
          idx_beg = -1
          interval = null

          for (; idx_end < getArr(this).length; idx_end++) {
              interval = getArr(this)[idx_end]
              if (new_end < interval.start) {
                  if (idx_beg === -1) idx_beg = idx_end
                  break
              }
              if (new_start <= interval.end) {
                  if (idx_beg === -1) idx_beg = idx_end
                  new_start = Math.min(new_start, interval.start)
                  new_end = Math.max(new_end, interval.end)
              }
          }
          if (idx_beg === -1) setArr(this, [...getArr(this), {start: new_start, end: new_end}])
          else setArr(this, [...getArr(this).slice(0, idx_beg),
            {start: new_start, end: new_end},
          ...getArr(this).slice(idx_end)
          ])
        }
    }

    addPos(arr_pos) {
      this.addPosToArr(arr_pos, (_this, ...args) => _this.setPosArr(...args), (_this, ...args) => _this.getPosArr(...args), true)
    }

    addIgnoredPos(arr_pos) {
      function mergePos(_arr_pos) {
        let [start_min, end_max] = [_arr_pos[0].start, _arr_pos[0].end]
        for (const pos of _arr_pos) {
          start_min = Math.min(start_min, pos.start)
          end_max = Math.max(end_max, pos.end)
        }
        return {start: start_min, end: end_max}
      }
      let merged_pos = mergePos(arr_pos)
      this.addPosToArr([merged_pos], (_this, ...args) => _this.setIgnoredPosArr(...args), (_this, ...args) => _this.getIgnoredPosArr(...args), false)
    }

    checkIsIgnoredPos(_pos) {
      let pos = {..._pos}
      let i = 0

      for (const interval of this.getIgnoredPosArr()) {
          let [b1, b2] = [pos.start >= interval.start, pos.end <= interval.end]
          if (!b1) return -1
          else if (!b2 && pos.start <= interval.end) pos.start = interval.end
          else if (b2) return i
          i++
    }
    return -1
  }

  static getSubsetFileObjFromPosMap(_posMap) {
    let subsetFilePos = new SubsetFile()
    let [str_imported, str_notImported] = [strEd(getLabelFromTokenType(tt._import)), strArrToFieldName(notStr(strEd(getLabelFromTokenType(tt._import))))]
    let acc_obj = {[str_imported]: [], [str_notImported]: []}
    for (const elm of Object.values(_posMap)) {
      if (isNotEmptyObject(elm)) {
        if (isBeginWith(elm.type, majMinFirstCharStrRegexp(getLabelFromTokenType(tt._import)))) {
            acc_obj[str_imported].push(elm)
        } else {
          acc_obj[str_notImported].push(elm)
        }
    }
  }

    for (const str_key of Object.keys(acc_obj)) {
        let fct = null
        if (str_key === str_imported) fct = (_this, ...args) => _this.addIgnoredPos(...args)
        else if (str_key === str_notImported) fct = (_this, ...args) => _this.addPos(...args)
        if (fct) for (const elm of acc_obj[str_key]) {
            fct(subsetFilePos, s_getProp(elm, str_props).pos)
        }
    }

    return subsetFilePos
  }

  getArrSubsetFile(input) {
    let arrFile = this.getPosArr().reduce((acc, elm) => {
      return [...acc, input.substring(elm.start, elm.end)]
    }, [])
    return arrFile
  }
}

function getFileFromArrSubsetFile(arrSubsetFile) {
    return arrSubsetFile.join("\n")
}

export function getSubsetFileStrFromPosMap(posMap, filepath) {
  let input = fs.readFileSync(filepath, "utf8")

  let subsetFilePos = SubsetFile.getSubsetFileObjFromPosMap(posMap)

  let arrSubsetFile = subsetFilePos.getArrSubsetFile(input)
  let res = getFileFromArrSubsetFile(arrSubsetFile)

  return res
}
