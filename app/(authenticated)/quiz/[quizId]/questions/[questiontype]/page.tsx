// app/quiz/[quizid]/questions/[questiontype]/page.tsx
import Slideshow from "@/components/questions/slideshow/page";
import ImgHotspot from "@/components/questions/imghotspot/page";
import Pic2Pic from "@/components/questions/pic2pic/page";
import VidQn from "@/components/questions/vidqn/page";
import WhichOfImg from "@/components/questions/whichofimg/page";
import DragNDrop from "@/components/questions/dragndrop/page";

export default async function QuestionTypePage({
  params,
}: {
  params: Promise<{ quizid: string; questiontype: string }>;
}) {
  const { quizid, questiontype } = await params;

  switch (questiontype) {
    case "slideshow":
      return <Slideshow />;
    case "imghotspot":
      return <ImgHotspot />;
    case "pic2pic":
      return <Pic2Pic />;
    case "vidqn":
      return <VidQn />;
    case "whichofimg":
      return <WhichOfImg />;
    case "dragndrop":
      return <DragNDrop />;
    default:
      return <div>Invalid question type</div>;
  }
}
