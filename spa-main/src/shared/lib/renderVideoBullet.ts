export const renderVideoBullet = (className: string, isVideo: boolean): string => {
  const videoIcon = `<svg width="6" height="6" viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block; position: absolute; top: 50%; left: 55%; transform: translate(-50%, -50%); width: 4px; height: 4px;">
    <g opacity="0.5">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M5.44549 3.86674L1.9852 5.81584C1.14203 6.29084 0 5.79177 0 4.94926V1.05081C0 0.207812 1.14203 -0.290766 1.9852 0.184235L5.44549 2.13334C6.18484 2.54984 6.18484 3.45024 5.44549 3.86674Z" fill="currentColor"/>
    </g>
  </svg>`

  return `<span class="${className} relative">${isVideo ? videoIcon : ""}</span>`
}
