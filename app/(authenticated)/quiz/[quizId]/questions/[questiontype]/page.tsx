// app/quiz/[quizid]/questions/[questiontype]/page.tsx
import Slideshow from "@/components/questions/slideshow/page";
import ImgHotspot from "@/components/questions/imghotspot/page";
import Pic2Pic from "@/components/questions/pic2pic/page";
import VidQn from "@/components/questions/vidqn/page";
import WhichOfImg from "@/components/questions/whichofimg/page";
import DragNDrop from "@/components/questions/dragndrop/page";

export default function QuestionTypePage({
  params,
}: {
  params: { quizid: string; questiontype: string };
}) {
  const { quizid, questiontype } = params;

  switch (questiontype) {
    case "slideshow":
      return <Slideshow quizId={quizid} />;
    case "imghotspot":
      return <ImgHotspot quizId={quizid} />;
    case "pic2pic":
      return <Pic2Pic quizId={quizid} />;
    case "vidqn":
      return <VidQn quizId={quizid} />;
    case "whichofimg":
      return <WhichOfImg quizId={quizid} />;
    case "dragndrop":
      return <DragNDrop quizId={quizid} />;
    default:
      return <div>Invalid question type</div>;
  }
}
