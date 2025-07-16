// import { create } from "zustand";
// import { http } from "@/utils/http";
// import { TAxelorConfigModel } from "@/models/axelor/axelor";

// const initialStore = {
//   loading: false,
//   error: null,
//   config: null,
// };

// export const useAxelorStore = create<{
//   loading: boolean;
//   error: string | null;
//   config: TAxelorConfigModel | null;
//   fetchConfig: () => Promise<TAxelorConfigModel | null>;
//   clearStore: () => void;
// }>((set, get) => ({
//   ...initialStore,
//   fetchConfig: async () => {
//     try {
//       set({ loading: true });

//       const response = await http(`/ws/rest/com.axelor.studio.db.AppMyCrm`);

//       if (response.ok) {
//         const data = await response.json();
//         if (data.status === 0 && data.hasOwnProperty("data")) {
//           set({ config: data.data[0], error: null });
//           return data.data[0];
//         } else {
//           throw new Error(data.data?.message ?? "No data");
//         }
//       } else {
//         throw new Error(`${response.status} ${response.statusText}`);
//       }
//     } catch (e: any) {
//       set({ error: e?.message, config: null });
//     } finally {
//       set({ loading: false });
//     }
//   },
//   clearStore: () => {
//     set(initialStore);
//   },
// }));
