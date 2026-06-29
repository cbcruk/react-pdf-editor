import { Font } from "@react-pdf/renderer";
import boldUrl from "@pkg/render/fonts/Pretendard-Bold.otf?url";
import regularUrl from "@pkg/render/fonts/Pretendard-Regular.otf?url";

Font.register({
  family: "Pretendard",
  fonts: [
    { src: regularUrl, fontWeight: 400 },
    { src: boldUrl, fontWeight: 700 },
  ],
});
