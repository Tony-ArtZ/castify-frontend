import { getPodcast } from "@/actions/getPodcast";
import { auth } from "../../../auth";
import PlaylistPage from "./Playlist";

const page = async () => {
  const session = await auth();
  const pd = await getPodcast(session.user.id);
  return <PlaylistPage fetchedPodcasts={pd ? pd : []} />;
};

export default page;
